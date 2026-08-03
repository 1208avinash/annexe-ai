// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.1 — Risk Analyzer
// api/agents/risk/worker.js
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "risk_worker";
const VERSION = "1.0.0";

export async function run(input = {}) {

    const {
        projectId,
        architecture = {},
        technology = {},
        requirements = []
    } = input;

    if (!projectId) {
        return {
            success: false,
            agent: AGENT_ID,
            error: "projectId is required."
        };
    }

    const risks = [];
    const recommendations = [];
    let score = 0;

    if (!architecture.backend) {
        risks.push({
            type: "ARCHITECTURE",
            severity: "HIGH",
            message: "Backend architecture missing."
        });
        recommendations.push("Define backend architecture.");
        score += 30;
    }

    if (!architecture.frontend) {
        risks.push({
            type: "ARCHITECTURE",
            severity: "MEDIUM",
            message: "Frontend architecture missing."
        });
        recommendations.push("Define frontend architecture.");
        score += 20;
    }

    if (!technology.database) {
        risks.push({
            type: "DATABASE",
            severity: "HIGH",
            message: "Database technology not selected."
        });
        recommendations.push("Select a database technology.");
        score += 30;
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
        risks.push({
            type: "REQUIREMENTS",
            severity: "HIGH",
            message: "Requirements are missing."
        });
        recommendations.push("Provide functional requirements.");
        score += 20;
    }

    let overallRisk = "LOW";

    if (score >= 70) {
        overallRisk = "HIGH";
    } else if (score >= 30) {
        overallRisk = "MEDIUM";
    }

    return {
        success: true,
        agent: AGENT_ID,
        version: VERSION,
        projectId,
        overallRisk,
        score,
        risks,
        recommendations,
        _meta: {
            generatedAt: new Date().toISOString(),
            rc: "RC-5.1"
        }
    };
}

export default run;