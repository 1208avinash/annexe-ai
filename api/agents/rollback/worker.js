// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-4.5 — Rollback Manager
// api/agents/rollback/worker.js
// ───────────────────────────────────────────────────────────────
//
// Responsibility:
//
// Decide the recovery action after the Quality Gate.
//
// This worker DOES:
//
// ✓ Evaluate Quality Gate decision
// ✓ Recommend rollback / retry / continue
//
// This worker DOES NOT:
//
// ✗ Patch files
// ✗ Rebuild
// ✗ Retest
// ✗ Deploy
//
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "rollback_worker";
const VERSION = "1.0.0";

export async function run(input = {}) {

    const {

        projectId,

        qualityDecision

    } = input;

    if (!projectId) {

        return {

            success: false,

            agent: AGENT_ID,

            error: "projectId is required."

        };

    }

    if (!qualityDecision) {

        return {

            success: false,

            agent: AGENT_ID,

            error: "qualityDecision is required."

        };

    }

    let action = "CONTINUE";

    switch (qualityDecision) {

        case "PASS":
            action = "CONTINUE";
            break;

        case "FAIL":
            action = "ROLLBACK";
            break;

        case "REPAIR_REQUIRED":
            action = "RETURN_TO_REPAIR";
            break;

        default:
            action = "MANUAL_REVIEW";
            break;

    }

    return {

        success: true,

        agent: AGENT_ID,

        version: VERSION,

        projectId,

        qualityDecision,

        action,

        _meta: {

            generatedAt: new Date().toISOString(),

            rc: "RC-4.5"

        }

    };

}

export default run;