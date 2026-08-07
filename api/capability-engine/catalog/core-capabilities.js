function capability(data) {
    return {
        version: "1.0.0",
        compatibility: {
            frontend: ["React 19", "React + Vite"],
            backend: "FastAPI",
            database: "PostgreSQL"
        },
        aliases: [],
        ...data
    };
}

const coreCapabilities = [
    capability({
        name: "permissions",
        description: "Central permission definitions for application access control.",
        dependencies: [],
        frontend: {
            framework: "React + Vite",
            modules: ["role gating", "route guards"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/permissions"]
        },
        routes: ["/permissions"],
        permissions: ["permissions:read", "permissions:write"],
        database: ["permissions", "permission_assignments"],
        events: ["permissions.updated"]
    }),
    capability({
        name: "users",
        description: "User identity, profile, and account management capability.",
        dependencies: ["permissions"],
        frontend: {
            framework: "React + Vite",
            modules: ["user profile", "user administration"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/users"]
        },
        routes: ["/users"],
        permissions: ["users:read", "users:write"],
        database: ["users"],
        events: ["users.created", "users.updated"]
    }),
    capability({
        name: "roles",
        description: "Role assignment and authorization group capability.",
        dependencies: ["permissions"],
        frontend: {
            framework: "React + Vite",
            modules: ["role management"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/roles"]
        },
        routes: ["/roles"],
        permissions: ["roles:read", "roles:write"],
        database: ["roles", "role_permissions"],
        events: ["roles.updated"]
    }),
    capability({
        name: "authentication",
        description: "JWT login, token validation, and session bootstrap capability.",
        dependencies: ["users", "roles", "permissions", "logging", "health"],
        frontend: {
            framework: "React + Vite",
            modules: ["login", "session hydration"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/auth/login", "/auth/me"]
        },
        routes: ["/auth/login", "/auth/me"],
        permissions: ["auth:login", "auth:read"],
        database: ["users", "sessions"],
        events: ["auth.signed_in", "auth.signed_out"]
    }),
    capability({
        name: "dashboard",
        description: "Workspace overview, KPI cards, and recent activity surface.",
        dependencies: ["authentication", "reports", "health", "version", "logging"],
        frontend: {
            framework: "React + Vite",
            modules: ["dashboard cards", "recent activity"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/dashboard"]
        },
        routes: ["/dashboard", "/crm/summary"],
        permissions: ["dashboard:read"],
        database: ["dashboards", "dashboard_widgets"],
        events: ["dashboard.refreshed"]
    }),
    capability({
        name: "notifications",
        description: "Notification delivery and activity alert capability.",
        dependencies: ["authentication", "users", "logging"],
        frontend: {
            framework: "React + Vite",
            modules: ["notification center", "toast alerts"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/notifications"]
        },
        routes: ["/notifications"],
        permissions: ["notifications:read", "notifications:write"],
        database: ["notifications"],
        events: ["notifications.queued", "notifications.delivered"]
    }),
    capability({
        name: "whatsapp",
        description: "WhatsApp communication and notification capability.",
        dependencies: ["authentication", "users", "notifications"],
        frontend: {
            framework: "React + Vite",
            modules: ["WhatsApp settings", "message templates"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/whatsapp"]
        },
        routes: ["/whatsapp"],
        permissions: ["whatsapp:read", "whatsapp:write"],
        database: ["whatsapp_messages", "whatsapp_contacts"],
        events: ["whatsapp.queued", "whatsapp.delivered"]
    }),
    capability({
        name: "audit-logs",
        description: "Operational audit trail and compliance logging capability.",
        dependencies: ["authentication", "users", "logging"],
        frontend: {
            framework: "React + Vite",
            modules: ["audit viewer"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/audit-logs"]
        },
        routes: ["/audit-logs"],
        permissions: ["audit:read"],
        database: ["audit_logs"],
        events: ["audit.logged"]
    }),
    capability({
        name: "email",
        description: "Transactional email composition and delivery capability.",
        dependencies: ["authentication", "users"],
        frontend: {
            framework: "React + Vite",
            modules: ["email templates", "delivery queue"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/email"]
        },
        routes: ["/email"],
        permissions: ["email:send"],
        database: ["email_messages"],
        events: ["email.queued", "email.sent"]
    }),
    capability({
        name: "file-storage",
        description: "File attachment and document storage capability.",
        dependencies: ["authentication", "users"],
        frontend: {
            framework: "React + Vite",
            modules: ["file browser", "upload controls"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/files"]
        },
        routes: ["/files"],
        permissions: ["files:read", "files:write"],
        database: ["files", "file_versions"],
        events: ["files.uploaded"]
    }),
    capability({
        name: "invoices",
        description: "Invoice generation, billing, and payment tracking capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "notifications",
            "reports"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["invoice list", "invoice detail", "billing dashboard"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/invoices"]
        },
        routes: ["/invoices"],
        permissions: ["invoices:read", "invoices:write"],
        database: ["invoices", "invoice_items", "payments"],
        events: ["invoices.created", "invoices.paid"]
    }),
    capability({
        name: "settings",
        description: "Application settings and tenant configuration capability.",
        dependencies: ["authentication", "users", "logging"],
        frontend: {
            framework: "React + Vite",
            modules: ["settings forms"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/settings"]
        },
        routes: ["/settings"],
        permissions: ["settings:read", "settings:write"],
        database: ["settings"],
        events: ["settings.updated"]
    }),
    capability({
        name: "search",
        description: "Cross-entity search and discovery capability.",
        dependencies: ["logging"],
        frontend: {
            framework: "React + Vite",
            modules: ["global search"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/search"]
        },
        routes: ["/search"],
        permissions: ["search:read"],
        database: ["search_indexes"],
        events: ["search.executed"]
    }),
    capability({
        name: "reports",
        description: "Operational reporting and export capability.",
        dependencies: ["search", "audit-logs", "logging"],
        frontend: {
            framework: "React + Vite",
            modules: ["reports", "export center"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/reports"]
        },
        routes: ["/reports"],
        permissions: ["reports:read", "reports:export"],
        database: ["report_definitions", "report_runs"],
        events: ["reports.generated"]
    }),
    capability({
        name: "health",
        description: "Service health checks and readiness validation capability.",
        dependencies: [],
        frontend: {
            framework: "React + Vite",
            modules: ["service health view"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/health"]
        },
        routes: ["/health", "/ready"],
        permissions: ["system:read"],
        database: ["health_checks"],
        events: ["health.checked"]
    }),
    capability({
        name: "version",
        description: "Build version reporting and deployment metadata capability.",
        dependencies: [],
        frontend: {
            framework: "React + Vite",
            modules: ["version badge"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/version"]
        },
        routes: ["/version"],
        permissions: ["system:read"],
        database: ["releases"],
        events: ["version.published"]
    }),
    capability({
        name: "logging",
        description: "Structured request and application logging capability.",
        dependencies: [],
        frontend: {
            framework: "React + Vite",
            modules: ["observability panels"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/logs"]
        },
        routes: ["/logs"],
        permissions: ["logs:read"],
        database: ["log_entries"],
        events: ["logs.emitted"]
    }),
    capability({
        name: "crm",
        description: "Customer management, dashboard, and CRM shell capability.",
        dependencies: [
            "authentication",
            "users",
            "dashboard",
            "reports",
            "notifications",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["customer list", "customer detail", "crm shell"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/customers", "/crm/summary"]
        },
        routes: ["/customers", "/crm/summary"],
        permissions: ["crm:read", "crm:write"],
        database: ["customers", "activities"],
        events: ["crm.customer.created", "crm.customer.updated"]
    }),
    capability({
        name: "erp",
        description: "Enterprise resource planning coordination capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "inventory",
            "reports",
            "notifications",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["erp shell", "finance overview", "operations dashboard"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/erp", "/inventory"]
        },
        routes: ["/erp", "/inventory"],
        permissions: ["erp:read", "erp:write"],
        database: ["erp_accounts", "erp_transactions"],
        events: ["erp.record.created", "erp.record.updated"]
    }),
    capability({
        name: "hrms",
        description: "Human resource management capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "reports",
            "notifications",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["employee directory", "leave management", "payroll dashboard"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/hrms"]
        },
        routes: ["/hrms"],
        permissions: ["hrms:read", "hrms:write"],
        database: ["employees", "leave_requests", "payroll_runs"],
        events: ["hrms.employee.created", "hrms.payroll.executed"]
    }),
    capability({
        name: "hospital",
        description: "Hospital and patient management capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "reports",
            "notifications",
            "file-storage",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["patient registry", "appointments", "clinical dashboard"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/hospital"]
        },
        routes: ["/hospital"],
        permissions: ["hospital:read", "hospital:write"],
        database: ["patients", "appointments", "encounters"],
        events: ["hospital.patient.created", "hospital.appointment.scheduled"]
    }),
    capability({
        name: "marketplace",
        description: "Marketplace catalog, order, and seller coordination capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "reports",
            "notifications",
            "file-storage",
            "search",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["catalog", "orders", "seller dashboard"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/marketplace"]
        },
        routes: ["/marketplace"],
        permissions: ["marketplace:read", "marketplace:write"],
        database: ["products", "orders", "sellers"],
        events: ["marketplace.order.created", "marketplace.listing.published"]
    }),
    capability({
        name: "pos",
        description: "Point-of-sale checkout and register capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "inventory",
            "reports",
            "notifications",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["checkout register", "sales summary", "cash drawer"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/pos"]
        },
        routes: ["/pos"],
        permissions: ["pos:read", "pos:write"],
        database: ["sales", "register_sessions", "tenders"],
        events: ["pos.sale.completed", "pos.shift.closed"]
    }),
    capability({
        name: "inventory",
        description: "Inventory control, stock movement, and stock valuation capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "reports",
            "notifications",
            "search",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["stock ledger", "reorder alerts", "warehouse dashboard"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/inventory"]
        },
        routes: ["/inventory"],
        permissions: ["inventory:read", "inventory:write"],
        database: ["stock_items", "stock_moves", "warehouses"],
        events: ["inventory.stock.updated", "inventory.reorder.triggered"]
    }),
    capability({
        name: "school",
        description: "School administration, student, and academic operations capability.",
        dependencies: [
            "authentication",
            "users",
            "roles",
            "permissions",
            "dashboard",
            "reports",
            "notifications",
            "file-storage",
            "settings"
        ],
        frontend: {
            framework: "React + Vite",
            modules: ["student directory", "classrooms", "academic dashboard"]
        },
        backend: {
            framework: "FastAPI",
            routes: ["/school"]
        },
        routes: ["/school"],
        permissions: ["school:read", "school:write"],
        database: ["students", "classes", "enrollments"],
        events: ["school.student.enrolled", "school.term.published"]
    })
];

export default coreCapabilities;
