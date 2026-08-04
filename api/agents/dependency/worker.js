// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.2 — Dependency Validator
// api/agents/dependency/worker.js
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "dependency_worker";
const VERSION = "1.0.0";

export async function run(input = {}) {

    const {
        projectId,
        technology = {},
        environment = {}
    } = input;

    if (!projectId) {

        return {
            success: false,
            agent: AGENT_ID,
            error: "projectId is required."
        };

    }

    const missingDependencies = [];
    const versionConflicts = [];
    const missingEnvironment = [];
    const recommendations = [];

    let score = 100;

    // ----------------------------------------------------------
    // Database
    // ----------------------------------------------------------

    if (!technology.database) {

        missingDependencies.push("Database");

        recommendations.push(
            "Select a database technology."
        );

        score -= 20;

    }

    // ----------------------------------------------------------
    // Backend
    // ----------------------------------------------------------

    if (!technology.backend) {

        missingDependencies.push("Backend Framework");

        recommendations.push(
            "Choose a backend framework."
        );

        score -= 20;

    }

    // ----------------------------------------------------------
    // Frontend
    // ----------------------------------------------------------

    if (!technology.frontend) {

        missingDependencies.push("Frontend Framework");

        recommendations.push(
            "Choose a frontend framework."
        );

        score -= 20;

    }

    // ----------------------------------------------------------
    // OpenAI Key
    // ----------------------------------------------------------

    if (!environment.OPENAI_API_KEY) {

        missingEnvironment.push(
            "OPENAI_API_KEY"
        );

        recommendations.push(
            "Define OPENAI_API_KEY."
        );

        score -= 10;

    }

    // ----------------------------------------------------------

    let overallHealth = "GOOD";

    if (score < 80)
        overallHealth = "WARNING";

    if (score < 50)
        overallHealth = "CRITICAL";

    return {

        success: true,

        agent: AGENT_ID,

        version: VERSION,

        projectId,

        overallHealth,

        score,

        missingDependencies,

        versionConflicts,

        missingEnvironment,

        recommendations,

        _meta: {

            generatedAt: new Date().toISOString(),

            rc: "RC-5.2"

        }

    };

}

export default run;