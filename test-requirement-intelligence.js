// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-6.1
// Requirement Intelligence Test
// ───────────────────────────────────────────────────────────────

import { analyzeRequirement }
from "./lib/engineering-brain/requirement-intelligence/index.js";

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
    console.log(" REQUIREMENT INTELLIGENCE TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const result = await analyzeRequirement({

        projectId: "PROJECT-RC6-001",

        requirement:
            "Build an AI powered ecommerce platform"

    });

    assert(
        "worker executed",
        result.success === true,
        result
    );

    assert(
        "project id returned",
        result.projectId === "PROJECT-RC6-001",
        result.projectId
    );

    assert(
        "project type detected",
        result.report.projectType === "Ecommerce",
        result.report.projectType
    );

    assert(
        "overall score calculated",
        result.completeness.overall > 0,
        result.completeness.overall
    );

    assert(
        "missing information detected",
        result.missing.length > 0,
        result.missing
    );

    assert(
        "questions generated",
        result.questions.length > 0,
        result.questions
    );

    assert(
        "readiness returned",
        result.readiness !== undefined,
        result.readiness
    );

    assert(
        "confidence calculated",
        result.report.confidence > 0,
        result.report.confidence
    );

    console.log("");

    console.log("══════════════════════════════════════");
    console.log(" REQUIREMENT INTELLIGENCE RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);

    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Requirement Intelligence verified.");
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