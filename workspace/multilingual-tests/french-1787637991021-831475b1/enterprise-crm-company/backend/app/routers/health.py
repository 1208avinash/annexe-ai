from fastapi import APIRouter

from ..config import settings
from ..database import database_status
from ..version import BUILD_VERSION

router = APIRouter(tags=["system"])


@router.get("/health")
def health():
    return {
        "status": "ok",
        "project": settings.app_name,
        "environment": settings.app_env,
        "version": BUILD_VERSION,
        "locale": settings.default_locale,
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
