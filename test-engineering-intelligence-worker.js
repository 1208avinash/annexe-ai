// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.10
// Engineering Intelligence Engine Test
// ───────────────────────────────────────────────────────────────

import run from "./lib/agents/engineering-intelligence/worker.js";

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
    console.log(" ENGINEERING INTELLIGENCE TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const reports = [

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

    ];

    const result = await run({

        projectId: "PROJECT-RC5-010",

        reports

    });

    assert("worker executed", result !== null, result);
    assert("success", result.success === true, result);
    assert("agent id", result.agent === "engineering_intelligence_worker", result);
    assert("version", result.version === "1.0.0", result);
    assert("project id", result.projectId === "PROJECT-RC5-010", result);

    assert(
        "engineering score exists",
        typeof result.engineeringScore === "number",
        result
    );

    assert(
        "decision exists",
        ["PASS","REVIEW","BLOCK"].includes(result.decision),
        result
    );

    assert(
        "categories collected",
        result.evaluatedCategories.length === 5,
        result
    );

    assert(
        "report count",
        result.reportCount === 5,
        result
    );

    assert(
        "metadata exists",
        result._meta !== undefined,
        result
    );

    console.log("");

    console.log("══════════════════════════════════════");
    console.log(" ENGINEERING INTELLIGENCE RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);

    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Engineering Intelligence Engine verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();