import assert from "assert";

import EngineeringPlan from "./lib/planning-engine/contracts/engineering-plan.js";

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
console.log(" ENGINEERING PLAN TEST");
console.log("══════════════════════════════════════");
console.log("");

test("creates engineering plan", () => {

    const plan = new EngineeringPlan({

        planId: "PLAN-001",

        decisionId: "DEC-001",

        projectId: "CRM-001",

        title: "CRM Implementation",

        estimatedDuration: "12 weeks"

    });

    assert.equal(plan.planId, "PLAN-001");

    assert.equal(plan.projectId, "CRM-001");

    assert.equal(plan.estimatedDuration, "12 weeks");

});

test("toJSON works", () => {

    const plan = new EngineeringPlan();

    assert.ok(plan.toJSON());

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" ENGINEERING PLAN RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");

} else {

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");