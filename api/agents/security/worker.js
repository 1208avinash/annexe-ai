// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.4
// Security Validator
// api/agents/security/worker.js
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "security_worker";
const VERSION = "1.0.0";

export async function run(input = {}) {

    const {
        projectId,
        security = {}
    } = input;

    if (!projectId) {
        return {
            success: false,
            agent: AGENT_ID,
            error: "projectId is required."
        };
    }

    const findings = [];
    const recommendations = [];
    let score = 100;

    if (!security.authentication) {
        findings.push("Authentication strategy not defined.");
        recommendations.push("Define an authentication strategy.");
        score -= 20;
    }

    if (!security.authorization) {
        findings.push("Authorization strategy not defined.");
        recommendations.push("Define authorization roles and permissions.");
        score -= 20;
    }

    if (!security.https) {
        findings.push("HTTPS requirement not specified.");
        recommendations.push("Enforce HTTPS for all communications.");
        score -= 15;
    }

    if (!security.inputValidation) {
        findings.push("Input validation strategy missing.");
        recommendations.push("Validate all external inputs.");
        score -= 15;
    }

    if (!security.secretManagement) {
        findings.push("Secret management not defined.");
        recommendations.push("Store secrets securely using environment variables or a secret manager.");
        score -= 15;
    }

    if (!security.encryption) {
        findings.push("Sensitive data encryption not defined.");
        recommendations.push("Encrypt sensitive data at rest and in transit.");
        score -= 15;
    }

    let status = "PASS";

    if (score < 80)
        status = "WARNING";

    if (score < 50)
        status = "CRITICAL";

    return {

        success: true,

        agent: AGENT_ID,

        version: VERSION,

        projectId,

        category: "SECURITY",

        status,

        score,

        findings,

        recommendations,

        _meta: {

            generatedAt: new Date().toISOString(),

            rc: "RC-5.4"

        }

    };

}

export default run;