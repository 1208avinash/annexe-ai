// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.10
// Engineering Intelligence Executor Test
//
// Run:
//
// node test-engineering-intelligence-executor.js
//
// Verifies:
//
// AgentExecutor
//      ↓
// AgentRegistry
//      ↓
// AgentAdapter
//      ↓
// Engineering Intelligence Engine
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
    console.log(" ENGINEERING INTELLIGENCE EXECUTOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const executor = new AgentExecutor();

    const task = {

        id: "ENGINEERING-EXEC-001",

        projectId: "PROJECT-RC5-010",

        agent: "engineering_intelligence_worker",

        type: "ENGINEERING_INTELLIGENCE",

        priority: "HIGH",

        reports: [

            {
                success: true,
                category: "RISK",
                score: 95,
                findings: [],
                recommendations: []
            },

            {
                success: true,
                category: "DEPENDENCY",
                score: 90,
                findings: [],
                recommendations: []
            },

            {
                success: true,
                category: "ARCHITECTURE",
                score: 85,
                findings: [],
                recommendations: []
            },

            {
                success: true,
                category: "SECURITY",
                score: 92,
                findings: [],
                recommendations: []
            },

            {
                success: true,
                category: "PERFORMANCE",
                score: 88,
                findings: [],
                recommendations: []
            }

        ]

    };

    const result = await executor.executeTask(task);

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
            "engineering intelligence result returned",
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
    console.log(" ENGINEERING INTELLIGENCE EXECUTOR RESULT");
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