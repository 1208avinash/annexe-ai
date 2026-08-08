import CapabilityRegistry from "./capability-registry.js";
import CapabilityResolver from "./capability-resolver.js";
import coreCapabilities from "./catalog/core-capabilities.js";

function slugify(value) {
    return String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}

const KEYWORD_MAP = [
    ["authentication", ["auth", "login", "jwt", "session", "signin", "sign in"]],
    ["users", ["user", "users", "account", "accounts", "profile"]],
    ["roles", ["role", "roles"]],
    ["permissions", ["permission", "permissions", "rbac", "access control"]],
    ["dashboard", ["dashboard", "overview", "kpi", "metrics"]],
    ["notifications", ["notification", "notifications", "alert", "alerting"]],
    ["audit-logs", ["audit", "audit log", "audit logs", "compliance"]],
    ["email", ["email", "mail", "message sending"]],
    ["invoices", ["invoice", "invoicing", "billing", "billing system"]],
    ["whatsapp", ["whatsapp", "whats app"]],
    ["file-storage", ["file", "files", "upload", "attachment", "storage"]],
    ["settings", ["setting", "settings", "configuration", "preferences"]],
    ["search", ["search", "find", "lookup"]],
    ["reports", ["report", "reports", "analytics", "export"]],
    ["health", ["health", "ready", "readiness"]],
    ["version", ["version", "build version"]],
    ["logging", ["logging", "logs", "observability"]],
    ["crm", ["crm", "customer", "customer management", "sales pipeline", "lead", "contact"]],
    ["erp", ["erp", "enterprise resource planning", "finance", "operations", "inventory control"]],
    ["hrms", ["hrms", "human resources", "payroll", "employee"]],
    ["hospital", ["hospital", "patient", "appointment", "clinical"]],
    ["marketplace", ["marketplace", "seller", "catalog", "order"]],
    ["pos", ["pos", "point of sale", "checkout", "register"]],
    ["inventory", ["inventory", "stock", "warehouse", "reorder"]],
    ["school", ["school", "student", "class", "attendance"]]
];

export default class ApplicationAssembler {

    constructor({
        registry = null,
        resolver = null
    } = {}) {
        this.registry = registry ?? new CapabilityRegistry(coreCapabilities);
        this.resolver = resolver ?? new CapabilityResolver({ registry: this.registry });
    }

    recommendCapabilities({ request = {}, businessAnalysis = {}, template = null } = {}) {
        const fragments = [
            request.project?.name,
            request.project?.description,
            request.project?.industry,
            request.challenge,
            request.solution,
            ...(Array.isArray(request.requirements) ? request.requirements : []),
            businessAnalysis.projectName,
            businessAnalysis.industry,
            ...(Array.isArray(businessAnalysis.features) ? businessAnalysis.features : []),
            ...(Array.isArray(businessAnalysis.recommendedCapabilities) ? businessAnalysis.recommendedCapabilities : [])
        ]
            .filter(Boolean)
            .map(value => String(value).toLowerCase())
            .join(" ");

        const recommended = new Set(["health", "version", "logging"]);

        for (const [capabilityName, keywords] of KEYWORD_MAP) {
            if (keywords.some(keyword => fragments.includes(keyword))) {
                recommended.add(capabilityName);
            }
        }

        if ((businessAnalysis.projectType ?? "").toLowerCase() === "crm" || String(template?.templateId ?? "").includes("crm")) {
            recommended.add("crm");
        }

        return unique(Array.from(recommended));
    }

    assemble({ request = {}, businessAnalysis = {}, template = null, requestedCapabilities = null } = {}) {
        const capabilityNames = unique(
            requestedCapabilities ??
            businessAnalysis.recommendedCapabilities ??
            this.recommendCapabilities({ request, businessAnalysis, template })
        );

        const capabilities = this.resolver.resolve(
            capabilityNames,
            {
                frontend: template?.frontend ?? businessAnalysis.frontend ?? "React + Vite",
                backend: template?.backend ?? businessAnalysis.backend ?? "FastAPI",
                database: template?.database ?? businessAnalysis.database ?? "PostgreSQL"
            }
        );

        const capabilityPaths = capabilities.map(capability => `capabilities/${slugify(capability.name)}`);

        return {
            assemblyId: `CA-${Date.now()}`,
            projectId: request.project?.projectId ?? request.project?.id ?? null,
            recommendedCapabilities: capabilityNames,
            selectedCapabilities: capabilities.map(capability => capability.name),
            capabilities,
            capabilityPaths,
            dependencies: unique(capabilities.flatMap(capability => capability.dependencies ?? [])),
            stackMetadata: {
                frontend: template?.frontend ?? businessAnalysis.frontend ?? "React + Vite",
                backend: template?.backend ?? businessAnalysis.backend ?? "FastAPI",
                database: template?.database ?? businessAnalysis.database ?? "PostgreSQL"
            },
            directories: unique([
                "capabilities",
                ...capabilityPaths,
                ...capabilityPaths.flatMap(capabilityPath => [
                    `${capabilityPath}/backend`,
                    `${capabilityPath}/frontend`,
                    `${capabilityPath}/tests`,
                    `${capabilityPath}/docs`
                ])
            ]),
            requiredFiles: unique([
                "capabilities/index.json",
                "capabilities/README.md",
                ...capabilities.flatMap(capability => [
                    `capabilities/${slugify(capability.name)}/capability.json`,
                    `capabilities/${slugify(capability.name)}/backend/README.md`,
                    `capabilities/${slugify(capability.name)}/frontend/README.md`,
                    `capabilities/${slugify(capability.name)}/tests/README.md`,
                    `capabilities/${slugify(capability.name)}/docs/README.md`,
                    `capabilities/${slugify(capability.name)}/dependencies.json`
                ])
            ]),
            validation: {
                approved: capabilities.length > 0,
                count: capabilities.length
            }
        };
    }

}
