import { renderLayout } from "./layouts/MainLayout.jsx";

export default function App() {
  return renderLayout({
    title: "Factory Health CRM",
    modules: [
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
  });
}
