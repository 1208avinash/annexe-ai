from sqlalchemy import func, select

from ..models import Customer, User
from ..security import hash_password


class CRMRepository:
    @staticmethod
    def get_user_by_email(db, email: str):
        normalized_email = (email or "").strip().lower()
        if not normalized_email:
            return None
        return db.scalars(select(User).where(User.email == normalized_email)).first()

    @staticmethod
    def get_customer(db, customer_id: int):
        return db.get(Customer, customer_id)

    @staticmethod
    def list_customers(db):
        return db.scalars(select(Customer).order_by(Customer.created_at.desc(), Customer.id.desc())).all()

    @staticmethod
    def create_customer(db, payload):
        customer = Customer(**payload)
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def update_customer(db, customer: Customer, payload):
        for key, value in payload.items():
            if value is not None:
                setattr(customer, key, value)
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete_customer(db, customer: Customer):
        db.delete(customer)
        db.commit()

    @staticmethod
    def dashboard_summary(db, project_name: str, modules: list[str]):
        customer_count = db.scalar(select(func.count()).select_from(Customer)) or 0
        user_count = db.scalar(select(func.count()).select_from(User)) or 0
        active_customer_count = db.scalar(
            select(func.count()).select_from(Customer).where(Customer.status == "active")
        ) or 0
        recent_customers = db.scalars(
            select(Customer).order_by(Customer.created_at.desc(), Customer.id.desc()).limit(5)
        ).all()
        return {
            "project": project_name,
            "modules": modules,
            "customer_count": customer_count,
            "active_customer_count": active_customer_count,
            "user_count": user_count,
            "recent_customers": recent_customers
        }

    @staticmethod
    def ensure_seed_data(db, admin_email: str, admin_password: str, project_name: str):
        user = CRMRepository.get_user_by_email(db, admin_email)
        if user is None:
            db.add(
                User(
                    email=admin_email.lower(),
                    full_name=f"{project_name} Admin",
                    hashed_password=hash_password(admin_password),
                    role="Administrator",
                    is_active=True
                )
            )

        customer_count = db.scalar(select(func.count()).select_from(Customer)) or 0
        if customer_count == 0:
            samples = [
                {
                    "name": "Apex Retail Group",
                    "email": "hello@apexretail.com",
                    "company": "Apex Retail Group",
                    "status": "active",
                    "phone": "+1-202-555-0142",
                    "owner": "Enterprise Sales",
                    "notes": "High priority enterprise account."
                },
                {
                    "name": "Northwind Logistics",
                    "email": "ops@northwindlogistics.com",
                    "company": "Northwind Logistics",
                    "status": "active",
                    "phone": "+1-202-555-0168",
                    "owner": "Customer Success",
                    "notes": "Expansion candidate for Q3."
                },
                {
                    "name": "BluePeak Health",
                    "email": "care@bluepeakhealth.com",
                    "company": "BluePeak Health",
                    "status": "prospect",
                    "phone": "+1-202-555-0191",
                    "owner": "Sales Operations",
                    "notes": "Awaiting security review."
                }
            ]
            for customer in samples:
                db.add(Customer(**customer))

        db.commit()
