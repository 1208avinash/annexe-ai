// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// Repair Worker
//
// Phase 11.1
//
// PURPOSE
// -------
// Consumes an APPROVED debug result and converts the approved
// diagnosis + patch plan into a structured repair plan.
//
// IMPORTANT
// ---------
// This worker NEVER:
//
// • modifies source code
// • edits files
// • commits git
// • rebuilds projects
// • deploys
//
// It only produces a repair contract.
//
// The repair contract will later be executed by a dedicated
// repair engine (future phase).
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "repair_worker";
const VERSION  = 1;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function ok(value) {
    return {
        success: true,
        value
    };
}

function fail(error) {
    return {
        success: false,
        error
    };
}

function normalizeDiagnosis(diagnosis = {}) {

    return {

        status:
            diagnosis.status ||
            "unknown",

        summary:
            diagnosis.summary ||
            "",

        errors:
            Array.isArray(diagnosis.errors)
                ? diagnosis.errors
                : [],

        warnings:
            Array.isArray(diagnosis.warnings)
                ? diagnosis.warnings
                : [],

        files:
            Array.isArray(diagnosis.files)
                ? diagnosis.files
                : []

    };

}

function normalizePatchPlan(plan = []) {

    if (!Array.isArray(plan)) {
        return [];
    }

    return plan.map((step, index) => ({

        id:
            step.id ||
            `PATCH-${index + 1}`,

        file:
            step.file ||
            null,

        action:
            step.action ||
            "review",

        description:
            step.description ||
            "",

        priority:
            step.priority ||
            "MEDIUM"

    }));

}

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

function validateInput(input = {}) {

    if (!input.projectId) {
        return fail("projectId is required");
    }

    if (!input.debugId) {
        return fail("debugId is required");
    }

    return ok({

        projectId: input.projectId,

        debugId: input.debugId,

        diagnosis:
            normalizeDiagnosis(
                input.diagnosis
            ),

        patchPlan:
            normalizePatchPlan(
                input.patchPlan
            )

    });

}

/*
|--------------------------------------------------------------------------
| Repair Plan Builder
|--------------------------------------------------------------------------
*/

function buildRepairPlan({

    projectId,

    debugId,

    diagnosis,

    patchPlan

}) {

    const repairs = [];

    for (const patch of patchPlan) {

        repairs.push({

            id:
                `REPAIR-${repairs.length + 1}`,

            file:
                patch.file,

            action:
                patch.action,

            reason:
                patch.description,

            priority:
                patch.priority,

            approved: true,

            status: "PENDING"

        });

    }

    return {

        id:
            `REPAIR-${debugId}`,

        projectId,

        debugId,

        diagnosis,

        patchPlan,

        repairActions:
            repairs,

        summary: {

            totalRepairs:
                repairs.length,

            highPriority:
                repairs.filter(
                    r => r.priority === "HIGH"
                ).length,

            mediumPriority:
                repairs.filter(
                    r => r.priority === "MEDIUM"
                ).length,

            lowPriority:
                repairs.filter(
                    r => r.priority === "LOW"
                ).length

        }

    };

}

/*
|--------------------------------------------------------------------------
| Metadata Builder
|--------------------------------------------------------------------------
*/

function buildMeta(repairPlan) {

    return {

        projectId:
            repairPlan.projectId,

        debugId:
            repairPlan.debugId,

        repairCount:
            repairPlan.summary.totalRepairs,

        generatedAt:
            new Date().toISOString(),

        generatedBy:
            AGENT_ID,

        version:
            VERSION

    };

}

/*
|--------------------------------------------------------------------------
| Result Builder
|--------------------------------------------------------------------------
*/

function buildSuccessResult({

    projectId,

    debugId,

    diagnosis,

    patchPlan,

    repairPlan

}) {

    return {

        success: true,

        agent:
            AGENT_ID,

        version:
            VERSION,

        projectId,

        debugId,

        diagnosis,

        patchPlan,

        repairPlan,

        _meta:
            buildMeta(repairPlan)

    };

}
function buildFailureResult(projectId, debugId, error) {

    return {

        success: false,

        agent:
            AGENT_ID,

        version:
            VERSION,

        projectId:
            projectId || null,

        debugId:
            debugId || null,

        error,

        _meta: {

            generatedAt:
                new Date().toISOString(),

            generatedBy:
                AGENT_ID,

            version:
                VERSION

        }

    };

}

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

export function run(input = {}) {

    // ------------------------------------------------------------
    // Validate
    // ------------------------------------------------------------

    const validation = validateInput(input);

    if (!validation.success) {

        return buildFailureResult(

            input.projectId,

            input.debugId,

            validation.error

        );

    }

    const {

        projectId,

        debugId,

        diagnosis,

        patchPlan

    } = validation.value;


    // ------------------------------------------------------------
    // Build Repair Plan
    // ------------------------------------------------------------

    const repairPlan = buildRepairPlan({

        projectId,

        debugId,

        diagnosis,

        patchPlan

    });


    // ------------------------------------------------------------
    // Return Success
    // ------------------------------------------------------------

    return buildSuccessResult({

        projectId,

        debugId,

        diagnosis,

        patchPlan,

        repairPlan

    });

}

/*
|--------------------------------------------------------------------------
| Self Test Helper
|--------------------------------------------------------------------------
|
| Used only by unit tests.
| No side effects.
|
*/

export function validateRepairInput(input = {}) {

    return validateInput(input);

}

/*
|--------------------------------------------------------------------------
| Package Information
|--------------------------------------------------------------------------
*/

export const RepairWorkerInfo = {

    id: AGENT_ID,

    version: VERSION,

    description:
        "ANNEXE AI Repair Worker"

};

/*
|--------------------------------------------------------------------------
| HTTP Handler
|--------------------------------------------------------------------------
|
| Standalone Vercel endpoint.
|
| POST /api/agents/repair/worker
|
*/

export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            error: "Method not allowed"

        });

    }

    try {

        const result = run(req.body || {});

        if (!result.success) {

            return res.status(400).json(result);

        }

        return res.status(200).json(result);

    }
    catch (error) {

        console.error(
            "REPAIR WORKER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Unexpected repair worker error"

        });

    }

}