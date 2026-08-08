// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.12
// Governance Engine Integration Test
// ───────────────────────────────────────────────────────────────

import AutonomousOrchestrator from "./lib/orchestrator/engine.js";

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
    console.log(" GOVERNANCE ENGINE TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const engine = new AutonomousOrchestrator();

    assert(
        "governance initialized",
        engine.governance !== undefined
    );

    assert(
        "plugin registered",
        engine.governance.plugins.length > 0
    );

    engine.addTask({

        id: "TASK-001",

        projectId: "PROJECT-RC5-012",

        type: "generation",

        agent: "generation_worker",

        architecture: {},

        security: {},

        performance: {},

        requirements: []

    });

    const result = await engine.processNext();

    assert(
        "processNext returned",
        result !== null,
        result
    );

    assert(
        "task blocked by governance",
        result.status === "BLOCKED",
        result
    );

    assert(
        "governance decision returned",
        result.governance !== undefined,
        result
    );

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" GOVERNANCE ENGINE RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);

    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Governance Engine verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main().catch(err => {

    console.error(err);

    process.exit(1);

});