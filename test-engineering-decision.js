import assert from "assert";

import EngineeringDecision from "./api/decision-engine/contracts/engineering-decision.js";

let passed = 0;
let failed = 0;

function test(name, fn) {

    try {

        fn();

        console.log(`✅ ${name}`);

        passed++;

    }

    catch (err) {

        console.log(`❌ ${name}`);

        console.error(err.message);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" ENGINEERING DECISION TEST");
console.log("══════════════════════════════════════");
console.log("");

test("creates decision", () => {

    const decision = new EngineeringDecision({

        projectId: "CRM-001",

        recommendationId: "REC-001",

        approved: true,

        decisionConfidence: 0.94

    });

    assert.equal(decision.projectId, "CRM-001");

    assert.equal(decision.approved, true);

    assert.equal(decision.decisionConfidence, 0.94);

});

test("toJSON works", () => {

    const decision = new EngineeringDecision();

    assert.ok(decision.toJSON());

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" ENGINEERING DECISION RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");

}

else {

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");