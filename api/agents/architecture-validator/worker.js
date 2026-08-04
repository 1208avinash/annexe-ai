// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.3
// Architecture Validator
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "architecture_validator_worker";
const VERSION = "1.0.0";

export async function run(input = {}) {

    const {
        projectId,
        architecture = {},
        requirements = []
    } = input;

    if (!projectId) {
        return {
            success: false,
            agent: AGENT_ID,
            error: "projectId is required."
        };
    }

    const issues = [];
    const recommendations = [];
    let score = 100;

    if (!architecture.backend) {
        issues.push("Missing backend layer.");
        recommendations.push("Define backend architecture.");
        score -= 25;
    }

    if (!architecture.frontend) {
        issues.push("Missing frontend layer.");
        recommendations.push("Define frontend architecture.");
        score -= 25;
    }

    if (!architecture.database) {
        issues.push("Missing database layer.");
        recommendations.push("Define database architecture.");
        score -= 20;
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
        issues.push("Requirements not provided.");
        recommendations.push("Provide project requirements.");
        score -= 30;
    }

    let overallHealth = "GOOD";

    if (score < 80) overallHealth = "WARNING";
    if (score < 50) overallHealth = "CRITICAL";

    return {
        success: true,
        agent: AGENT_ID,
        version: VERSION,
        projectId,
        overallHealth,
        score,
        issues,
        recommendations,
        _meta: {
            generatedAt: new Date().toISOString(),
            rc: "RC-5.3"
        }
    };
}

export default run;