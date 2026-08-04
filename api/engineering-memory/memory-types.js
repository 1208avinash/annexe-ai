// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1
// Engineering Memory Platform
// Memory Types
// ───────────────────────────────────────────────────────────────

export const MemoryDomain = Object.freeze({

    KNOWLEDGE: "knowledge",

    PATTERN: "pattern",

    COMPONENT: "component",

    ARCHITECTURE: "architecture",

    PROJECT_DNA: "project_dna",

    DECISION: "decision",

    LESSON: "lesson",

    FAILURE: "failure",

    STANDARD: "standard",

    METRIC: "metric",

    EVIDENCE: "evidence"

});

export const MemoryCategory = Object.freeze({

    GENERAL: "general",

    BACKEND: "backend",

    FRONTEND: "frontend",

    DATABASE: "database",

    AI: "ai",

    SECURITY: "security",

    PERFORMANCE: "performance",

    TESTING: "testing",

    DEVOPS: "devops",

    GOVERNANCE: "governance",

    BUSINESS: "business"

});

export function isValidMemoryDomain(domain) {

    return Object.values(MemoryDomain).includes(domain);

}

export function isValidMemoryCategory(category) {

    return Object.values(MemoryCategory).includes(category);

}