// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-4.4 — Quality Gate Worker
// api/agents/quality-gate/worker.js
// ───────────────────────────────────────────────────────────────
//
// Responsibility:
//
// Evaluate rebuild + retest results and decide whether the
// project can continue to delivery or must return for repair.
//
// This worker DOES:
//
// ✓ Evaluate rebuild status
// ✓ Evaluate retest status
// ✓ Produce autonomous decision
//
// This worker DOES NOT:
//
// ✗ rebuild
// ✗ retest
// ✗ patch
// ✗ deploy
// ✗ rollback
//
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "quality_gate_worker";
const VERSION = "1.0.0";

export async function run(input = {}) {

    const {

        projectId,

        rebuildResult,

        retestResult

    } = input;

    if (!projectId) {

        return {

            success: false,

            agent: AGENT_ID,

            error: "projectId is required."

        };

    }

    if (!rebuildResult) {

        return {

            success: false,

            agent: AGENT_ID,

            error: "rebuildResult is required."

        };

    }

    if (!retestResult) {

        return {

            success: false,

            agent: AGENT_ID,

            error: "retestResult is required."

        };

    }

    let decision = "PASS";

    if (
        rebuildResult.success !== true ||
        retestResult.success !== true
    ) {

        decision = "REPAIR_REQUIRED";

    }
    else if (
        retestResult.failed > 0
    ) {

        decision = "FAIL";

    }

    return {

        success: true,

        agent: AGENT_ID,

        version: VERSION,

        projectId,

        decision,

        rebuildResult,

        retestResult,

        _meta: {

            generatedAt: new Date().toISOString(),

            rc: "RC-4.4"

        }

    };

}

export default run;