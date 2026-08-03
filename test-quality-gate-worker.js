// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-4.4
// Quality Gate Worker Test
//
// Run:
//
// node test-quality-gate-worker.js
// ───────────────────────────────────────────────────────────────

import run from "./api/agents/quality-gate/worker.js";

let passed = 0;
let failed = 0;

function assert(name, condition, actual = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    } else {

        console.log(`❌ ${name}`);

        if (actual !== null) {

            console.log(actual);

        }

        failed++;

    }

}

async function main() {

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" QUALITY GATE WORKER TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await run({

        projectId: "PROJECT-PHASE10-001",

        rebuildResult: {

            success: true

        },

        retestResult: {

            success: true,

            failed: 0

        }

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

        result.agent === "quality_gate_worker",

        result

    );

    assert(

        "version",

        result.version === "1.0.0",

        result

    );

    assert(

        "project id",

        result.projectId === "PROJECT-PHASE10-001",

        result

    );

    assert(

        "decision returned",

        typeof result.decision === "string",

        result

    );

    assert(

        "decision PASS",

        result.decision === "PASS",

        result

    );

    assert(

        "rebuild preserved",

        result.rebuildResult.success === true,

        result

    );

    assert(

        "retest preserved",

        result.retestResult.success === true,

        result

    );

    assert(

        "metadata exists",

        result._meta !== undefined,

        result

    );

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" QUALITY GATE RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Quality Gate Worker verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();