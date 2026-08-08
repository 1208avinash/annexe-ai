// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-4.3
// Retest Worker Acceptance Test
//
// Run:
//
// node test-retest-worker.js
// ───────────────────────────────────────────────────────────────

import run from "./lib/agents/retest/worker.js";

let passed = 0;
let failed = 0;

function assert(name, condition, actual = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    } else {

        console.log(`❌ ${name}`);

        if (actual !== null)
            console.log(actual);

        failed++;

    }

}

async function main() {

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" RETEST WORKER TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await run({

        projectId: "PROJECT-PHASE10-001"

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

        result.agent === "retest_worker",

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

        "tests passed",

        result.status === "TESTS_PASSED",

        result

    );

    assert(

        "duration exists",

        typeof result.durationMs === "number",

        result

    );

    assert(

        "passed count",

        typeof result.passed === "number",

        result

    );

    assert(

        "failed count",

        typeof result.failed === "number",

        result

    );

    assert(

        "coverage exists",

        typeof result.coverage === "number",

        result

    );

    assert(

        "logs returned",

        typeof result.logs === "string",

        result

    );

    assert(

        "metadata exists",

        result._meta !== undefined,

        result

    );

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" RETEST WORKER RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Retest Worker verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();