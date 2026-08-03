// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// Repair Worker Unit Test
//
// Phase 11.2
//
// Run:
//
// node test-repair-worker.js
// ───────────────────────────────────────────────────────────────

import { run } from "./api/agents/repair/worker.js";

let passed = 0;
let failed = 0;

function assert(name, condition, value = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    } else {

        console.log(`❌ ${name}`);

        if (value !== null) {

            console.log(value);

        }

        failed++;

    }

}

async function main() {

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" REPAIR WORKER TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = run({

        projectId: "PROJECT-PHASE10-001",

        debugId: "DBG-000001",

        diagnosis: {

            status: "failed",

            summary: "Compilation failed.",

            errors: [

                "Unexpected token"

            ]

        },

        patchPlan: [

            {

                file: "src/App.jsx",

                action: "replace",

                description: "Replace invalid syntax.",

                priority: "HIGH"

            }

        ]

    });

    assert(

        "worker executed",

        result !== null,

        result

    );

    assert(

        "success",

        result.success === true,

        result

    );

    assert(

        "agent id",

        result.agent === "repair_worker",

        result

    );

    console.log("");
    assert(

        "version",

        result.version === 1,

        result

    );

    assert(

        "project id preserved",

        result.projectId === "PROJECT-PHASE10-001",

        result

    );

    assert(

        "debug id preserved",

        result.debugId === "DBG-000001",

        result

    );

    assert(

        "diagnosis returned",

        result.diagnosis !== undefined,

        result

    );

    assert(

        "patch plan returned",

        Array.isArray(result.patchPlan),

        result

    );

    assert(

        "repair plan returned",

        result.repairPlan !== undefined,

        result

    );

    assert(

        "repair actions array",

        Array.isArray(result.repairPlan.repairActions),

        result

    );

    assert(

        "repair action count",

        result.repairPlan.repairActions.length === 1,

        result

    );

    assert(

        "metadata exists",

        result._meta !== undefined,

        result

    );

    console.log("");

    // ============================================================
    // Result Summary
    // ============================================================

    console.log("══════════════════════════════════════");
    console.log(" REPAIR WORKER RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Repair Worker verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");
        console.log("Investigate the production worker before");
        console.log("making any architectural changes.");
        console.log("");

    }

    console.log("══════════════════════════════════════");
    console.log("");

    process.exit(failed === 0 ? 0 : 1);

}

main().catch(error => {

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" REPAIR WORKER FATAL ERROR");
    console.log("══════════════════════════════════════");
    console.log("");

    console.error(error);

    process.exit(1);

});