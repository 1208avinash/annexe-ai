// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.3
// Architecture Validator Test
//
// Run:
//
// node test-architecture-validator-worker.js
//
// ───────────────────────────────────────────────────────────────

import run from "./lib/agents/architecture-validator/worker.js";

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
    console.log(" ARCHITECTURE VALIDATOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await run({

        projectId: "PROJECT-RC5-003",

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

        result.agent === "architecture_validator_worker",

        result

    );

    assert(

        "version",

        result.version === "1.0.0",

        result

    );

    assert(

        "project id",

        result.projectId === "PROJECT-RC5-003",

        result

    );

    assert(

        "overall health returned",

        typeof result.overallHealth === "string",

        result

    );

    assert(

        "score returned",

        typeof result.score === "number",

        result

    );

    assert(

        "issues array",

        Array.isArray(result.issues),

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
    console.log(" ARCHITECTURE VALIDATOR RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Architecture Validator verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();