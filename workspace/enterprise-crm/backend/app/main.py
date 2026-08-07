from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .routers import auth_router, crm_router, customers_router, health_router
from .services.crm_service import CRMService


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.on_event("startup")
    def bootstrap_database():
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
            "status": "ready"
        }

    return app


app = create_app()
