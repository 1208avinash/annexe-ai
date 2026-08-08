// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.5
// Performance Validator Executor Test
//
// Run:
//
// node test-performance-executor.js
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

        if (actual !== null)
            console.log(actual);

        failed++;

    }

}

async function main() {

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" PERFORMANCE EXECUTOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const executor = new AgentExecutor();

    const task = {

        id: "PERFORMANCE-EXEC-001",

        projectId: "PROJECT-RC5-005",

        agent: "performance_worker",

        type: "PERFORMANCE_VALIDATION",

        priority: "HIGH",

        performance: {

            caching: true,
            databaseIndexing: true,
            pagination: true,
            asyncProcessing: true,
            loadBalancing: true,
            rateLimiting: true,
            monitoring: true,
            logging: true

        }

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
            "performance validator result returned",
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
    console.log(" PERFORMANCE EXECUTOR RESULT");
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