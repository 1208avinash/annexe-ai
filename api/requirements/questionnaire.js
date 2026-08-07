import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

import RequirementAnalyzer from "./requirement-analyzer.js";
import { getApplicationComposition } from "../capability-engine/application-compositions.js";

const analyzer = new RequirementAnalyzer();

export const QUESTIONNAIRE_STEPS = [
    {
        key: "industry",
        question: "What industry are you in?",
        prompt: "Industry"
    },
    {
        key: "employees",
        question: "How many employees?",
        prompt: "Employees"
    },
    {
        key: "problems",
        question: "What problems are you trying to solve?",
        prompt: "Problems"
    },
    {
        key: "users",
        question: "Who will use the system?",
        prompt: "Users"
    },
    {
        key: "mobileAccess",
        question: "Do you need mobile access?",
        prompt: "Mobile",
        type: "boolean"
    },
    {
        key: "integrations",
        question: "Any third-party integrations?",
        prompt: "Integrations"
    },
    {
        key: "budget",
        question: "Budget?",
        prompt: "Budget"
    },
    {
        key: "deploymentPreference",
        question: "Deployment preference?",
        prompt: "Deployment"
    }
];

function normalize(value) {
    return String(value ?? "").trim();
}

function slugify(value) {
    return normalize(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}

function splitList(value) {
    return normalize(value)
        .split(/,|\n| and /i)
        .map(part => part.trim())
        .filter(Boolean);
}

function asBoolean(value) {
    const text = normalize(value).toLowerCase();
    if (!text) {
        return false;
    }
    return ["yes", "y", "true", "1", "on"].includes(text);
}

function inferApplicationTypeFromBrief(text) {
    const value = text.toLowerCase();

    const map = [
        ["crm", ["real estate", "agency", "customer", "lead", "sales", "crm", "contact"]],
        ["erp", ["erp", "finance", "operations", "inventory", "procurement"]],
        ["hrms", ["hr", "employee", "payroll", "leave", "recruitment"]],
        ["hospital", ["hospital", "healthcare", "patient", "clinical", "medical"]],
        ["marketplace", ["marketplace", "seller", "catalog", "order", "commerce"]],
        ["pos", ["pos", "checkout", "register", "retail", "store"]],
        ["inventory", ["inventory", "warehouse", "stock", "reorder", "logistics"]],
        ["school", ["school", "student", "teacher", "attendance", "academic"]]
    ];

    let bestType = "crm";
    let bestScore = -1;

    for (const [type, keywords] of map) {
        const score = keywords.reduce((total, keyword) => total + (value.includes(keyword) ? 1 : 0), 0);
        if (score > bestScore) {
            bestType = type;
            bestScore = score;
        }
    }

    return bestType;
}

function inferBusinessType(applicationType, industry, problems) {
    const problemText = normalize(problems).toLowerCase();
    if (applicationType === "crm" && problemText.includes("real estate")) {
        return "Real Estate CRM";
    }

    const defaults = {
        crm: "CRM",
        erp: "ERP",
        hrms: "HRMS",
        hospital: "Hospital System",
        marketplace: "Marketplace",
        pos: "Point of Sale",
        inventory: "Inventory System",
        school: "School System"
    };

    return industry ? `${industry} ${defaults[applicationType] ?? "Platform"}`.trim() : defaults[applicationType] ?? "Business Application";
}

function composeProjectName(industry, businessType) {
    const normalizedIndustry = normalize(industry);
    const normalizedBusinessType = normalize(businessType);

    if (!normalizedIndustry) {
        return normalizedBusinessType;
    }

    if (normalizedBusinessType.toLowerCase().includes(normalizedIndustry.toLowerCase())) {
        return normalizedBusinessType;
    }

    return `${normalizedIndustry} ${normalizedBusinessType}`.trim();
}

function inferUsersFromBrief(usersText, employeesText) {
    const users = splitList(usersText);
    const employeeCount = Number.parseInt(normalize(employeesText), 10);

    if (users.length === 0) {
        users.push("Administrators", "Operational Users");
    }

    if (Number.isFinite(employeeCount) && employeeCount > 0) {
        users.push(`${employeeCount} employees`);
    }

    return unique(users);
}

function inferRequiredFeatures(problemsText, mobileAccess) {
    const text = normalize(problemsText).toLowerCase();
    const features = [];

    const keywordMap = [
        ["customer", "Customer Management"],
        ["lead", "Lead Tracking"],
        ["invoice", "Invoicing"],
        ["billing", "Invoicing"],
        ["dashboard", "Dashboard"],
        ["report", "Reports"],
        ["notification", "Notifications"],
        ["whatsapp", "WhatsApp Notifications"],
        ["mobile", "Mobile Access"],
        ["approval", "Approvals"],
        ["inventory", "Inventory"],
        ["employee", "Employee Management"],
        ["patient", "Patient Management"],
        ["student", "Student Management"],
        ["order", "Order Management"],
        ["booking", "Bookings"]
    ];

    for (const [keyword, feature] of keywordMap) {
        if (text.includes(keyword)) {
            features.push(feature);
        }
    }

    if (mobileAccess) {
        features.push("Mobile Access");
    }

    return unique(features);
}

function inferIntegrations(integrationsText) {
    const text = normalize(integrationsText).toLowerCase();
    const integrations = [];

    const keywordMap = [
        ["whatsapp", "WhatsApp"],
        ["email", "Email"],
        ["sms", "SMS"],
        ["stripe", "Stripe"],
        ["razorpay", "Razorpay"],
        ["payment", "Payments"],
        ["calendar", "Calendar"],
        ["google calendar", "Google Calendar"],
        ["accounting", "Accounting"]
    ];

    for (const [keyword, label] of keywordMap) {
        if (text.includes(keyword)) {
            integrations.push(label);
        }
    }

    if (integrations.length === 0) {
        return [];
    }

    return unique(integrations);
}

function inferDeployment(deploymentPreference, mobileAccess) {
    const text = normalize(deploymentPreference).toLowerCase();

    if (text.includes("kubernetes")) {
        return "Kubernetes";
    }
    if (text.includes("docker")) {
        return "Docker";
    }
    if (text.includes("cloud")) {
        return "Cloud";
    }
    if (text.includes("on-prem") || text.includes("on prem")) {
        return "On-premise";
    }
    if (text.includes("aws")) {
        return "AWS";
    }
    if (text.includes("azure")) {
        return "Azure";
    }

    return mobileAccess ? "Cloud + Mobile" : "Docker + PostgreSQL";
}

function inferSecurity(integrations, mobileAccess) {
    const security = ["Authentication", "JWT", "RBAC", "Password hashing"];

    if (integrations.some(item => item.toLowerCase() === "whatsapp")) {
        security.push("Audit logging");
    }

    if (mobileAccess) {
        security.push("Device-aware access control");
    }

    return unique(security);
}

function buildNarrative(answers) {
    return [
        answers.industry,
        answers.employees ? `${answers.employees} employees` : "",
        answers.problems,
        answers.users,
        answers.mobileAccess ? "mobile access" : "",
        answers.integrations,
        answers.budget,
        answers.deploymentPreference
    ]
        .filter(Boolean)
        .join(" ");
}

function computeCapabilityRecommendation({ applicationType, projectName, industry, problems, integrations, features }) {
    const brief = buildNarrative({
        industry,
        employees: "",
        problems,
        users: "",
        mobileAccess: features.some(feature => feature.toLowerCase().includes("mobile")),
        integrations: integrations.join(", "),
        budget: "",
        deploymentPreference: ""
    });

    const composition = getApplicationComposition(applicationType);
    const analysis = analyzer.analyze({
        requestText: brief,
        applicationType
    });

    return unique([
        ...composition.capabilities,
        ...analysis.recommendedCapabilities,
        ...(integrations.some(item => item === "WhatsApp") ? ["whatsapp"] : []),
        ...(features.some(item => item.toLowerCase().includes("invoice")) ? ["invoices"] : [])
    ]);
}

export function analyzeQuestionnaire(answers = {}, options = {}) {
    const rawIndustry = normalize(answers.industry);
    const problems = normalize(answers.problems);
    const integrations = inferIntegrations(answers.integrations ?? "");
    const mobileAccess = asBoolean(answers.mobileAccess);
    const applicationType = options.type
        ? normalize(options.type).toLowerCase()
        : inferApplicationTypeFromBrief(buildNarrative(answers));
    const industry = rawIndustry || getApplicationComposition(applicationType).industry;
    const businessType = inferBusinessType(applicationType, industry, problems);
    const users = inferUsersFromBrief(answers.users, answers.employees);
    const requiredFeatures = inferRequiredFeatures(problems, mobileAccess);
    const deployment = inferDeployment(answers.deploymentPreference, mobileAccess);
    const security = inferSecurity(integrations, mobileAccess);
    const projectName = composeProjectName(industry, businessType);
    const projectId = slugify(projectName);
    const recommendedCapabilities = computeCapabilityRecommendation({
        applicationType,
        projectName,
        industry,
        problems,
        integrations,
        features: requiredFeatures
    });

    const requirementAnalysis = {
        analysisId: `RA-${Date.now()}`,
        requestText: buildNarrative(answers),
        normalizedText: buildNarrative(answers).toLowerCase(),
        applicationType,
        industry,
        businessType,
        employees: Number.parseInt(normalize(answers.employees), 10) || null,
        users,
        requiredFeatures,
        integrations,
        deployment,
        security,
        budget: normalize(answers.budget) || null,
        mobileAccess,
        projectName,
        projectId,
        recommendedCapabilities
    };

    const applicationComposition = analyzer.buildApplicationComposition({
        ...requirementAnalysis,
        applicationType
    });

    applicationComposition.projectName = projectName;
    applicationComposition.name = projectName;
    applicationComposition.projectId = projectId;
    applicationComposition.industry = industry;
    applicationComposition.businessType = businessType;
    applicationComposition.requirements = requiredFeatures;
    applicationComposition.integrations = integrations;
    applicationComposition.deployment = deployment;
    applicationComposition.security = security;
    applicationComposition.capabilities = recommendedCapabilities;
    applicationComposition.proposal = {
        proposalId: `PROP-${Date.now()}`,
        title: `${projectName} Proposal`,
        summary: problems || `Deliver a ${businessType} for ${industry}.`,
        industry,
        employees: requirementAnalysis.employees,
        users,
        requiredFeatures,
        integrations,
        budget: requirementAnalysis.budget,
        mobileAccess,
        deployment,
        security,
        recommendedCapabilities
    };

    return {
        questionnaire: {
            answers: {
                industry: rawIndustry,
                employees: normalize(answers.employees),
                problems,
                users: normalize(answers.users),
                mobileAccess,
                integrations: normalize(answers.integrations),
                budget: normalize(answers.budget),
                deploymentPreference: normalize(answers.deploymentPreference)
            }
        },
        requirementAnalysis,
        applicationComposition
    };
}

export async function promptQuestionnaire(initialAnswers = {}) {
    const rl = readline.createInterface({ input, output });
    const answers = { ...initialAnswers };

    try {
        for (const step of QUESTIONNAIRE_STEPS) {
            const current = answers[step.key];
            const suffix = current ? ` [${current}]` : "";
            const reply = await rl.question(`${step.question}${suffix}: `);
            if (reply.trim()) {
                answers[step.key] = step.type === "boolean" ? asBoolean(reply) : reply.trim();
            }
        }
    }
    finally {
        rl.close();
    }

    return answers;
}

export default {
    QUESTIONNAIRE_STEPS,
    analyzeQuestionnaire,
    promptQuestionnaire
};
