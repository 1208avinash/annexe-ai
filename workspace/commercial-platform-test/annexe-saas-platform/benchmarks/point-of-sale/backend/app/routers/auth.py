from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..dependencies import get_current_user
from ..database import get_db
from ..schemas import LoginRequest, LoginResponse, UserRead
from ..services.crm_service import CRMService

router = APIRouter(prefix="/auth", tags=["auth"])
service = CRMService()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return service.login(db, payload)


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user
