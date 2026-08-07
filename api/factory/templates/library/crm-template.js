// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 21.4
// CRM Production Template
// Enterprise CRM Knowledge Blueprint
// ───────────────────────────────────────────────────────────────

import ProjectTemplate
    from "../project-template.js";

export default new ProjectTemplate({

    templateId:
        "crm-enterprise",

    name:
        "Enterprise CRM",

    category:
        "Business Management",

    industry:
        "CRM",

    // ----------------------------------------------------------
    // Technology
    // ----------------------------------------------------------

    frontend:
        "React 19",

    backend:
        "FastAPI",

    database:
        "PostgreSQL",

    deployment:
        "Docker",

    authentication:
        "JWT",

    authorization:
        "RBAC",

    // ----------------------------------------------------------
    // Business Modules
    // ----------------------------------------------------------

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

    ],

    // ----------------------------------------------------------
    // Database Entities
    // ----------------------------------------------------------

    entities: [

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

    ],

    // ----------------------------------------------------------
    // Backend Services
    // ----------------------------------------------------------

    services: [

        "Authentication Service",

        "Customer Service",

        "Lead Service",

        "Contact Service",

        "Reporting Service",

        "Notification Service"

    ],

    // ----------------------------------------------------------
    // API Resources
    // ----------------------------------------------------------

    apis: [

        "/auth",

        "/users",

        "/customers",

        "/leads",

        "/contacts",

        "/companies",

        "/tasks",

        "/reports"

    ],

    // ----------------------------------------------------------
    // User Roles
    // ----------------------------------------------------------

    roles: [

        "Administrator",

        "Manager",

        "Sales Executive",

        "Support Executive"

    ],

    // ----------------------------------------------------------
    // Business Workflows
    // ----------------------------------------------------------

    workflows: [

        "Lead Qualification",

        "Customer Onboarding",

        "Sales Opportunity",

        "Task Assignment",

        "Customer Follow-up",

        "Reporting"

    ],

    // ----------------------------------------------------------
    // Quality
    // ----------------------------------------------------------

    testing: [

        "Unit Tests",

        "Integration Tests",

        "API Tests"

    ],

    documentation: [

        "API Documentation",

        "User Manual",

        "Deployment Guide"

    ]

});