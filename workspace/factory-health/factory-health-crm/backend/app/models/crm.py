from dataclasses import dataclass, field
from typing import List


@dataclass
class Customer:
    id: str
    name: str
    email: str = ""


@dataclass
class CRMModelCatalog:
    entities: List[str] = field(default_factory=lambda: [
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
])
