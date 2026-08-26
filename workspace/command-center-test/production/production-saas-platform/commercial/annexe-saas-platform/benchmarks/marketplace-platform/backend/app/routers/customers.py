from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..dependencies import get_current_user
from ..database import get_db
from ..schemas import CustomerCreate, CustomerRead, CustomerUpdate
from ..services.crm_service import CRMService

router = APIRouter(prefix="/customers", tags=["customers"])
service = CRMService()


@router.get("", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.list_customers(db)


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.get_customer(db, customer_id)


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.create_customer(db, payload)


@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.update_customer(db, customer_id, payload)


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.delete_customer(db, customer_id)
