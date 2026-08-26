from fastapi import HTTPException, status

from ..config import settings
from ..localization import translate_message
from ..repositories.crm_repository import CRMRepository
from ..security import create_access_token, verify_password


class CRMService:
    def __init__(self):
        self.project_name = settings.app_name
        self.modules = [
  "Authentication",
  "Dashboard",
  "Customers",
  "Leads",
  "Contacts",
  "Companies",
  "Sales Pipeline",
  "Tasks",
  "Calendar",
  "Reports",
  "Notifications",
  "Settings"
]
        self.entities = [
  "User",
  "Role",
  "Permission",
  "Customer",
  "Lead",
  "Contact",
  "Company",
  "Opportunity",
  "Task",
  "Activity",
  "Notification"
]
        self.services = [
  "Authentication Service",
  "Customer Service",
  "Lead Service",
  "Contact Service",
  "Reporting Service",
  "Notification Service"
]
        self.apis = [
  "/auth",
  "/users",
  "/customers",
  "/leads",
  "/contacts",
  "/companies",
  "/tasks",
  "/reports"
]

    def bootstrap(self, db):
        CRMRepository.ensure_seed_data(db, settings.admin_email, settings.admin_password, self.project_name)

    def login(self, db, payload, locale: str | None = None):
        user = CRMRepository.get_user_by_email(db, payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=translate_message("errors.auth.invalidCredentials", locale)
            )

        token = create_access_token(
            subject=user.email,
            secret_key=settings.secret_key,
            expires_minutes=settings.access_token_expire_minutes,
            extra_claims={
                "role": user.role,
                "full_name": user.full_name
            }
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }

    def list_customers(self, db):
        return CRMRepository.list_customers(db)

    def get_customer(self, db, customer_id: int, locale: str | None = None):
        customer = CRMRepository.get_customer(db, customer_id)
        if customer is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=translate_message("errors.customers.notFound", locale))
        return customer

    def create_customer(self, db, payload):
        return CRMRepository.create_customer(db, payload.model_dump())

    def update_customer(self, db, customer_id: int, payload, locale: str | None = None):
        customer = self.get_customer(db, customer_id, locale)
        return CRMRepository.update_customer(db, customer, payload.model_dump(exclude_unset=True))

    def delete_customer(self, db, customer_id: int, locale: str | None = None):
        customer = self.get_customer(db, customer_id, locale)
        CRMRepository.delete_customer(db, customer)
        return {"deleted": True, "customer_id": customer_id}

    def summary(self, db):
        return CRMRepository.dashboard_summary(db, self.project_name, self.modules)
