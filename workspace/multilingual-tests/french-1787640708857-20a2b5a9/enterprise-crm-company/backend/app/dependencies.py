from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .localization import resolve_request_locale, translate_message
from .repositories.crm_repository import CRMRepository
from .security import decode_access_token


def get_current_user(request: Request, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    locale = resolve_request_locale(request)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate_message("errors.auth.missingBearerToken", locale)
        )

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_access_token(token, settings.secret_key)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate_message("errors.auth.invalidOrExpiredToken", locale)
        ) from None
    user = CRMRepository.get_user_by_email(db, payload.get("sub", ""))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate_message("errors.auth.userNotFoundOrInactive", locale)
        )
    return user
