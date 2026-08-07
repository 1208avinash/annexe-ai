from fastapi import APIRouter

router = APIRouter(prefix="/crm", tags=["crm"])


@router.get("/summary")
def summary():
    return {
        "project": "Factory Health CRM",
        "modules": [
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
    }
