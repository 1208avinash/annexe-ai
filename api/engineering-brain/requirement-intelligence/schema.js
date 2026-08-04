// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-6.1
// Requirement Intelligence Schema
// ───────────────────────────────────────────────────────────────
//
// Defines the standard data contract for the
// ANNEXE Engineering Brain.
//
// Every Engineering Brain module must produce
// and consume this structure.
// ───────────────────────────────────────────────────────────────

export const ENGINE_VERSION = "RC-6.1";

export const COMPLETENESS_CATEGORIES = [

    "business",

    "functional",

    "technical",

    "security",

    "performance",

    "deployment",

    "compliance",

    "timeline",

    "budget"

];

export const READINESS = {

    NOT_READY: "NOT_READY",

    NEEDS_CLARIFICATION: "NEEDS_CLARIFICATION",

    READY_WITH_WARNINGS: "READY_WITH_WARNINGS",

    READY: "READY"

};

export function createRequirementReport(projectId = null) {

    return {

        success: true,

        agent: "requirement_intelligence",

        version: ENGINE_VERSION,

        projectId,

        report: {

            projectType: "",

            domain: "",

            businessGoal: "",

            complexity: "UNKNOWN",

            confidence: 0

        },

        completeness: {

            business: 0,

            functional: 0,

            technical: 0,

            security: 0,

            performance: 0,

            deployment: 0,

            compliance: 0,

            timeline: 0,

            budget: 0,

            overall: 0

        },

        readiness: READINESS.NOT_READY,

        ready: false,

        missing: [],

        questions: [],

        recommendations: [],

        assumptions: [],

        metadata: {

            engine: "ANNEXE Engineering Brain",

            module: "Requirement Intelligence",

            processedAt: new Date().toISOString()

        }

    };

}