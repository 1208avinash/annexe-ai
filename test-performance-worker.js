// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.5
// Performance Validator Test
// ───────────────────────────────────────────────────────────────

import run from "./lib/agents/performance/worker.js";

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
    console.log(" PERFORMANCE VALIDATOR TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await run({

        projectId: "PROJECT-RC5-005",

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

    });

    assert("worker executed", result !== null, result);
    assert("success", result.success === true, result);
    assert("agent id", result.agent === "performance_worker", result);
    assert("version", result.version === "1.0.0", result);
    assert("project id", result.projectId === "PROJECT-RC5-005", result);
    assert("category", result.category === "PERFORMANCE", result);
    assert("status", result.status === "PASS", result);
    assert("score", result.score === 100, result);
    assert("findings array", Array.isArray(result.findings), result);
    assert("recommendations array", Array.isArray(result.recommendations), result);
    assert("metadata exists", result._meta !== undefined, result);

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" PERFORMANCE VALIDATOR RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Performance Validator verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();