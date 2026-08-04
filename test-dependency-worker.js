// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.2
// Dependency Validator Test
//
// Run:
//
// node test-dependency-worker.js
//
// ───────────────────────────────────────────────────────────────

import run from "./api/agents/dependency/worker.js";

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
    console.log(" DEPENDENCY VALIDATOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await run({

        projectId: "PROJECT-RC5-002",

        technology: {

            backend: "FastAPI",

            frontend: "React",

            database: "PostgreSQL"

        },

        environment: {

            OPENAI_API_KEY: "dummy-key"

        }

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

        result.agent === "dependency_worker",

        result

    );

    assert(

        "version",

        result.version === "1.0.0",

        result

    );

    assert(

        "project id",

        result.projectId === "PROJECT-RC5-002",

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

        "missing dependencies array",

        Array.isArray(result.missingDependencies),

        result

    );

    assert(

        "missing environment array",

        Array.isArray(result.missingEnvironment),

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
    console.log(" DEPENDENCY VALIDATOR RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Dependency Validator verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();