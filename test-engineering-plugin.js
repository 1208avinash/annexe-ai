// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.13
// Engineering Governance Plugin Test
// ───────────────────────────────────────────────────────────────

import engineeringPlugin
from "./lib/orchestrator/plugins/engineering-plugin.js";

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
    console.log(" ENGINEERING PLUGIN TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await engineeringPlugin.review({

        projectId: "PROJECT-RC5-013",

        agent: "generation_worker",

        architecture: {
            backend: "FastAPI",
            frontend: "React",
            database: "PostgreSQL"
        },

        security: {
            authentication: true,
            authorization: true,
            https: true
        },

        performance: {
            caching: true,
            monitoring: true
        },

        requirements: [
            "Authentication",
            "Dashboard"
        ]

    });

    assert("review executed", result !== null, result);

    assert(
        "decision returned",
        result.decision !== undefined,
        result
    );

    assert(
        "allowed flag",
        typeof result.allowed === "boolean",
        result
    );

    assert(
        "metadata returned",
        result.metadata !== undefined,
        result
    );

    console.log("");

    console.log("══════════════════════════════════════");
    console.log(" ENGINEERING PLUGIN RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Engineering Plugin verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();