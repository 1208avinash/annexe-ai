import logging
import time

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import init_db
from .logging_config import configure_logging
from .localization import get_locale_context
from .routers import auth_router, crm_router, customers_router, health_router
from .services.crm_service import CRMService
from .version import BUILD_VERSION


logger = configure_logging(settings.log_level)


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=BUILD_VERSION)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.middleware("http")
    async def request_logging(request: Request, call_next):
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("request_failed", extra={"path": request.url.path, "method": request.method})
            raise

        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.info(
            "request_completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": elapsed_ms
            }
        )
        response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        logger.warning("validation_error", extra={"path": request.url.path, "errors": exc.errors()})
        return JSONResponse(status_code=422, content={"detail": exc.errors()})

    @app.on_event("startup")
    def bootstrap_database():
        logger.info("startup", extra={"project": settings.app_name, "version": BUILD_VERSION})
        init_db()
        from .database import session_scope

        service = CRMService()
        with session_scope() as db:
            service.bootstrap(db)

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(customers_router)
    app.include_router(crm_router)

    @app.get("/")
    def root():
        return {
            "project": settings.app_name,
            "status": "ready",
            "version": BUILD_VERSION,
            "locale": get_locale_context()
        }

    return app


app = create_app()
