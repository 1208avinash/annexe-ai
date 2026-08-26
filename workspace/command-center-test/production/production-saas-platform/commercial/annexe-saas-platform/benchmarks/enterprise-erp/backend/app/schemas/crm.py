from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class CustomerBase(BaseModel):
    name: str
    email: str | None = None
    company: str | None = None
    phone: str | None = None
    status: str = "active"
    owner: str | None = None
    notes: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    company: str | None = None
    phone: str | None = None
    status: str | None = None
    owner: str | None = None
    notes: str | None = None


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class DashboardSummary(BaseModel):
    project: str
    modules: list[str]
    customer_count: int
    active_customer_count: int
    user_count: int
    recent_customers: list[CustomerRead]
