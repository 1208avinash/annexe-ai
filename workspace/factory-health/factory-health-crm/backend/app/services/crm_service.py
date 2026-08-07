class CRMService:
    def __init__(self):
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
        self.services = [
  "Authentication Service",
  "Customer Service",
  "Lead Service",
  "Contact Service",
  "Reporting Service",
  "Notification Service"
]

    def list_modules(self):
        return self.modules

    def summary(self):
        return {
            "project": "Factory Health CRM",
            "modules": self.modules,
            "services": self.services
        }
