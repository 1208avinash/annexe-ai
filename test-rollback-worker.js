// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-4.5
// Rollback Worker Test
//
// Run:
//
// node test-rollback-worker.js
// ───────────────────────────────────────────────────────────────

import run from "./lib/agents/rollback/worker.js";

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
    console.log(" ROLLBACK WORKER TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await run({

        projectId: "PROJECT-PHASE10-001",

        qualityDecision: "FAIL"

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

        result.agent === "rollback_worker",

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

        "decision preserved",

        result.qualityDecision === "FAIL",

        result

    );

    assert(

        "rollback action selected",

        result.action === "ROLLBACK",

        result

    );

    assert(

        "metadata exists",

        result._meta !== undefined,

        result

    );

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" ROLLBACK WORKER RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Rollback Worker verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();