// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.1
// Risk Worker Test
//
// Run:
//
// node test-risk-worker.js
//
// ───────────────────────────────────────────────────────────────

import run from "./lib/agents/risk/worker.js";

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
    console.log(" RISK WORKER TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await run({

        projectId: "PROJECT-RC5-001",

        architecture: {

            backend: "FastAPI",

            frontend: "React"

        },

        technology: {

            database: "PostgreSQL"

        },

        requirements: [

            "Authentication",

            "Dashboard",

            "Reporting"

        ]

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

        result.agent === "risk_worker",

        result

    );

    assert(

        "version",

        result.version === "1.0.0",

        result

    );

    assert(

        "project id",

        result.projectId === "PROJECT-RC5-001",

        result

    );

    assert(

        "overall risk returned",

        typeof result.overallRisk === "string",

        result

    );

    assert(

        "score returned",

        typeof result.score === "number",

        result

    );

    assert(

        "risks array",

        Array.isArray(result.risks),

        result

    );

    assert(

        "recommendations array",

        Array.isArray(result.recommendations),

        result

    );

    assert(

        "metadata exists",

        result._meta !== undefined,

        result

    );

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" RISK WORKER RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Risk Worker verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();