from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..dependencies import get_current_user
from ..database import get_db
from ..schemas import DashboardSummary
from ..services.crm_service import CRMService

router = APIRouter(prefix="/crm", tags=["crm"])
service = CRMService()


@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.summary(db)


@router.get("/modules")
def modules():
    return {"modules": service.modules}


@router.get("/apis")
def apis():
    return {"apis": service.apis}
