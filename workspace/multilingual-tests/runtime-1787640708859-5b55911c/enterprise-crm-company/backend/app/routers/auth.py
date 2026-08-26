from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from ..dependencies import get_current_user
from ..database import get_db
from ..localization import resolve_request_locale
from ..schemas import LoginRequest, LoginResponse, UserRead
from ..services.crm_service import CRMService

router = APIRouter(prefix="/auth", tags=["auth"])
service = CRMService()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    return service.login(db, payload, resolve_request_locale(request))


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user
