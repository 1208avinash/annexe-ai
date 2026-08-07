import { ApplicationAssembler, CapabilityRegistry, coreCapabilities, getApplicationComposition, listApplicationTypes } from "../capability-engine/index.js";

const applicationAssembler = new ApplicationAssembler({
    registry: new CapabilityRegistry(coreCapabilities)
});

const TYPE_KEYWORDS = {
    crm: ["crm", "customer", "lead", "sales", "contact", "agency", "broker", "pipeline"],
    erp: ["erp", "finance", "operations", "inventory", "procurement", "planning"],
    hrms: ["hrms", "hr", "employee", "payroll", "leave", "recruitment"],
    hospital: ["hospital", "patient", "appointment", "clinical", "medical", "doctor", "nurse"],
    marketplace: ["marketplace", "seller", "buyer", "catalog", "order", "listing"],
    pos: ["pos", "point of sale", "checkout", "register", "till"],
    inventory: ["inventory", "stock", "warehouse", "reorder", "sku"],
    school: ["school", "student", "teacher", "class", "attendance", "exam"]
};

const INTEGRATION_KEYWORDS = [
    ["whatsapp", "WhatsApp"],
    ["email", "Email"],
    ["sms", "SMS"],
    ["payment", "Payments"],
    ["stripe", "Stripe"],
    ["razorpay", "Razorpay"],
    ["calendar", "Calendar"],
    ["google calendar", "Google Calendar"],
    ["accounting", "Accounting"]
];

const FEATURE_KEYWORDS = [
    ["customer management", "Customer Management"],
    ["customer", "Customer Management"],
    ["lead tracking", "Lead Tracking"],
    ["lead", "Lead Tracking"],
    ["invoice", "Invoicing"],
    ["invoicing", "Invoicing"],
    ["dashboard", "Dashboard"],
    ["report", "Reports"],
    ["reports", "Reports"],
    ["notification", "Notifications"],
    ["notifications", "Notifications"],
    ["authentication", "Authentication"],
    ["login", "Authentication"],
    ["users", "Users"],
    ["roles", "Roles"],
    ["permissions", "Permissions"],
    ["search", "Search"],
    ["inventory", "Inventory"],
    ["appointments", "Appointments"],
    ["employees", "Employees"],
    ["students", "Students"],
    ["orders", "Orders"]
];

const USER_KEYWORDS = [
    ["admin", "Administrators"],
    ["sales team", "Sales Team"],
    ["sales", "Sales Team"],
    ["agents", "Agents"],
    ["customers", "Customers"],
    ["managers", "Managers"],
    ["receptionists", "Receptionists"],
    ["teachers", "Teachers"],
    ["students", "Students"],
    ["patients", "Patients"],
    ["sellers", "Sellers"],
    ["warehouse staff", "Warehouse Staff"],
    ["hr team", "HR Team"]
];

function slugify(value) {
    return String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}

function normalizeText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferType(text, override = null) {
    const normalizedOverride = String(override ?? "").toLowerCase().trim();
    if (normalizedOverride && listApplicationTypes().includes(normalizedOverride)) {
        return normalizedOverride;
    }

    let bestType = "crm";
    let bestScore = -1;

    for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
        const score = keywords.reduce((total, keyword) => {
            return total + (text.includes(keyword) ? 1 : 0);
        }, 0);

        if (score > bestScore) {
            bestType = type;
            bestScore = score;
        }
    }

    return bestType;
}

function inferIndustry(text, applicationType) {
    const industryMap = {
        crm: ["real estate", "agency", "sales", "brokerage"],
        erp: ["erp", "enterprise", "finance", "operations"],
        hrms: ["hr", "human resources", "people"],
        hospital: ["hospital", "healthcare", "medical", "clinic"],
        marketplace: ["marketplace", "commerce", "retail", "ecommerce"],
        pos: ["pos", "retail", "restaurant", "store"],
        inventory: ["inventory", "warehouse", "logistics", "supply chain"],
        school: ["school", "education", "academic", "campus"]
    };

    const keywords = industryMap[applicationType] ?? [];
    for (const keyword of keywords) {
        if (text.includes(keyword)) {
            return keyword.replace(/\b\w/g, letter => letter.toUpperCase());
        }
    }

    return getApplicationComposition(applicationType).industry;
}

function inferBusinessType(text, applicationType) {
    const businessTypeMap = {
        crm: "CRM",
        erp: "ERP",
        hrms: "HRMS",
        hospital: "Hospital System",
        marketplace: "Marketplace",
        pos: "Point of Sale",
        inventory: "Inventory System",
        school: "School System"
    };

    if (applicationType === "crm") {
        return "CRM";
    }

    return businessTypeMap[applicationType] ?? "Business Application";
}

function inferUsers(text) {
    const matches = USER_KEYWORDS
        .filter(([keyword]) => text.includes(keyword))
        .map(([, label]) => label);

    if (matches.length > 0) {
        return unique(matches);
    }

    return ["Administrators", "Operational Users"];
}

function inferFeatures(text) {
    return unique(
        FEATURE_KEYWORDS
            .filter(([keyword]) => text.includes(keyword))
            .map(([, label]) => label)
    );
}

function inferIntegrations(text) {
    return unique(
        INTEGRATION_KEYWORDS
            .filter(([keyword]) => text.includes(keyword))
            .map(([, label]) => label)
    );
}

function inferDeployment(text) {
    if (text.includes("kubernetes")) {
        return "Kubernetes";
    }

    if (text.includes("docker")) {
        return "Docker";
    }

    if (text.includes("aws")) {
        return "AWS";
    }

    if (text.includes("azure")) {
        return "Azure";
    }

    return "Docker + PostgreSQL";
}

function inferSecurity(text) {
    const security = [
        "Authentication",
        "JWT",
        "RBAC",
        "Password hashing"
    ];

    if (text.includes("whatsapp") || text.includes("notifications")) {
        security.push("Audit logging");
    }

    if (text.includes("sso")) {
        security.push("Single sign-on");
    }

    if (text.includes("2fa") || text.includes("two factor")) {
        security.push("Two-factor authentication");
    }

    return unique(security);
}

function buildProjectIdentity(text, applicationType, businessType, industry) {
    const composition = getApplicationComposition(applicationType);
    const useGenericName = applicationType === "crm" && !text.includes("agency");
    const projectName = useGenericName
        ? composition.name
        : `${industry} ${businessType}`;

    const projectId = useGenericName
        ? composition.projectId
        : slugify(projectName);

    return {
        projectName,
        projectId
    };
}

function buildAnalysisSummary(text, applicationType, requestText, { projectName, projectId }, extracted) {
    const composition = getApplicationComposition(applicationType);
    const analyzerRequest = {
        project: {
            projectId,
            name: projectName,
            description: requestText,
            industry: extracted.industry
        },
        challenge: requestText,
        solution: requestText,
        requirements: extracted.requiredFeatures
    };

    const recommendedCapabilities = unique([
        ...composition.capabilities,
        ...applicationAssembler.recommendCapabilities({
            request: analyzerRequest,
            businessAnalysis: {
                projectType: applicationType,
                industry: extracted.industry,
                recommendedCapabilities: composition.capabilities,
                features: extracted.requiredFeatures
            },
            template: composition
        }),
        ...(extracted.requiredFeatures.some(feature => feature.toLowerCase().includes("invoice")) ? ["invoices"] : []),
        ...(extracted.integrations.includes("WhatsApp") ? ["whatsapp"] : [])
    ]);

    return {
        requestText,
        normalizedText: text,
        applicationType,
        industry: extracted.industry,
        businessType: extracted.businessType,
        users: extracted.users,
        requiredFeatures: extracted.requiredFeatures,
        integrations: extracted.integrations,
        deployment: extracted.deployment,
        security: extracted.security,
        projectName,
        projectId,
        recommendedCapabilities,
        capabilitySummary: {
            selectedCount: recommendedCapabilities.length,
            source: "natural-language-analysis"
        }
    };
}

export default class RequirementAnalyzer {

    analyze({ requestText = "", applicationType = null } = {}) {
        const normalizedText = normalizeText(requestText).toLowerCase();
        const inferredType = inferType(normalizedText, applicationType);
        const industry = inferIndustry(normalizedText, inferredType);
        const businessType = inferBusinessType(normalizedText, inferredType);
        const users = inferUsers(normalizedText);
        const requiredFeatures = inferFeatures(normalizedText);
        const integrations = inferIntegrations(normalizedText);
        const deployment = inferDeployment(normalizedText);
        const security = inferSecurity(normalizedText);
        const identity = buildProjectIdentity(normalizedText, inferredType, businessType, industry);
        const summary = buildAnalysisSummary(
            normalizedText,
            inferredType,
            requestText,
            identity,
            {
                industry,
                businessType,
                users,
                requiredFeatures,
                integrations,
                deployment,
                security
            }
        );

        return {
            analysisId: `RA-${Date.now()}`,
            ...summary
        };
    }

    buildApplicationComposition(analysis) {
        const composition = getApplicationComposition(analysis.applicationType);

        return {
            applicationType: analysis.applicationType,
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectName: analysis.projectName,
            industry: analysis.industry,
            businessType: analysis.businessType,
            requirements: analysis.requiredFeatures,
            integrations: analysis.integrations,
            deployment: analysis.deployment,
            security: analysis.security,
            capabilities: analysis.recommendedCapabilities,
            capabilityPaths: analysis.recommendedCapabilities.map(name => `capabilities/${slugify(name)}`),
            stack: {
                backend: composition.backend,
                frontend: composition.frontend,
                database: composition.database
            },
            template: composition
        };
    }
}
