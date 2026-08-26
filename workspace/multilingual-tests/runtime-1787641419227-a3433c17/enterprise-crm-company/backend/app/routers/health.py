from fastapi import APIRouter, Request

from ..config import settings
from ..database import database_status
from ..localization import get_locale_context
from ..version import BUILD_VERSION

router = APIRouter(tags=["system"])


@router.get("/health")
def health(request: Request):
    locale_context = get_locale_context(request=request)
    return {
        "status": "ok",
        "project": settings.app_name,
        "environment": settings.app_env,
        "version": BUILD_VERSION,
        "locale": locale_context["locale"],
        "locale_context": locale_context,
        "supported_locales": settings.supported_locales,
        "database": database_status()
    }


@router.get("/ready")
def ready():
    db_status = database_status()
    return {
        "status": "ready" if db_status.get("status") == "ok" else "degraded",
        "database": db_status,
        "version": BUILD_VERSION
    }


@router.get("/version")
def version():
    return {
        "project": settings.app_name,
        "version": BUILD_VERSION,
        "build_version": BUILD_VERSION,
        "locale": settings.default_locale
    }
