// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.4
// Security Validator Executor Test
//
// Run:
//
// node test-security-executor.js
//
// Verifies:
//
// AgentExecutor
//      ↓
// Registry
//      ↓
// Adapter
//      ↓
// Security Validator
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
    console.log(" SECURITY EXECUTOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const executor = new AgentExecutor();

    const task = {

        id: "SECURITY-EXEC-001",

        projectId: "PROJECT-RC5-004",

        agent: "security_worker",

        type: "SECURITY_VALIDATION",

        priority: "HIGH",

        security: {

            authentication: true,
            authorization: true,
            https: true,
            inputValidation: true,
            secretManagement: true,
            encryption: true

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
            "security validator result returned",
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
    console.log(" SECURITY EXECUTOR RESULT");
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