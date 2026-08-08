// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// Repair Executor Integration Test
//
// Verifies:
//
// AgentExecutor
//      ↓
// AgentRegistry
//      ↓
// AgentAdapter
//      ↓
// Repair Worker
//
// Run:
//
// node test-repair-executor.js
// ───────────────────────────────────────────────────────────────

import { AgentExecutor } from "./lib/orchestrator/executor.js";

let passed = 0;
let failed = 0;

function assert(name, condition, value = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    } else {

        console.log(`❌ ${name}`);

        if (value !== null)
            console.log(value);

        failed++;

    }

}

async function main() {

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" REPAIR EXECUTOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const executor = new AgentExecutor();

    const result =
        await executor.executeTask({

            id: "REPAIR-EXEC-001",

            projectId: "PROJECT-PHASE10-001",

            agent: "repair_worker",

            type: "REPAIR",

            priority: "HIGH",

            debugId: "DBG-000001",

            diagnosis: {

                summary: "Compilation failed.",

                status: "failed",

                errors: [

                    "Unexpected token"

                ]

            },

            patchPlan: [

                {

                    file: "src/App.jsx",

                    action: "replace",

                    description: "Fix syntax",

                    priority: "HIGH"

                }

            ]

        });

    assert(
        "executor returned result",
        result !== null,
        result
    );

    assert(
        "valid execution status",
        [
            "COMPLETED",
            "FAILED",
            "PENDING_APPROVAL"
        ].includes(result.status),
        result
    );

    assert(
        "execution succeeded",
        result.success === true,
        result
    );

    assert(
        "repair plan returned",
        result.result &&
        result.result.repairPlan,
        result
    );

    console.log("");

    console.log("══════════════════════════════════════");
    console.log(" REPAIR EXECUTOR RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");

    } else {

        console.log("❌ FAIL");

    }

    console.log("");
    console.log("══════════════════════════════════════");

    process.exit(failed === 0 ? 0 : 1);

}

main().catch(error => {

    console.error(error);

    process.exit(1);

});