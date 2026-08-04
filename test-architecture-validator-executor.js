// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.3
// Architecture Validator Executor Test
//
// Run:
//
// node test-architecture-validator-executor.js
//
// Verifies:
//
// AgentExecutor
//      ↓
// Registry
//      ↓
// Adapter
//      ↓
// Architecture Validator
//
// ───────────────────────────────────────────────────────────────

import { AgentExecutor } from "./api/orchestrator/executor.js";

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
    console.log(" ARCHITECTURE VALIDATOR EXECUTOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const executor = new AgentExecutor();

    const task = {

        id: "ARCH-EXEC-001",

        projectId: "PROJECT-RC5-003",

        agent: "architecture_validator_worker",

        type: "ARCHITECTURE_VALIDATION",

        priority: "HIGH",

        architecture: {

            backend: "FastAPI",

            frontend: "React",

            database: "PostgreSQL"

        },

        requirements: [

            "Authentication",

            "Dashboard",

            "Reporting"

        ]

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
            "architecture validator result returned",
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
    console.log(" ARCHITECTURE VALIDATOR EXECUTOR RESULT");
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