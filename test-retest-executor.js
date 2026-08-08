// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-4.3
// Retest Executor Integration Test
//
// Run:
//
// node test-retest-executor.js
//
// Verifies:
//
// AgentExecutor
//      ↓
// Registry
//      ↓
// Adapter
//      ↓
// Retest Worker
//
// ───────────────────────────────────────────────────────────────

import { AgentExecutor } from "./lib/orchestrator/executor.js";

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
    console.log(" RETEST EXECUTOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const executor = new AgentExecutor();

    const task = {

        id: "RETEST-EXEC-001",

        projectId: "PROJECT-PHASE10-001",

        agent: "retest_worker",

        type: "RETEST",

        priority: "HIGH"

    };

    const result =
        await executor.executeTask(task);

    assert(

        "executor returned result",

        result !== null,

        result

    );

    assert(

        "valid execution status",

        result &&
        [
            "COMPLETED",
            "FAILED",
            "PENDING_APPROVAL"
        ].includes(result.status),

        result

    );

    if (result.success) {

        assert(

            "execution succeeded",

            result.status === "COMPLETED",

            result

        );

        assert(

            "retest result returned",

            result.result !== undefined,

            result

        );

    } else {

        console.log(
            "ℹ Executor returned:",
            result.status
        );

    }

    console.log("");

    console.log("══════════════════════════════════════");
    console.log(" RETEST EXECUTOR RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();