import assert from "assert";

import PlanningEngine from "./api/planning-engine/planning-engine.js";

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
console.log(" PLANNING ENGINE TEST");
console.log("══════════════════════════════════════");
console.log("");

const engine = new PlanningEngine();

test("creates engineering plan", () => {

    const plan = engine.createPlan({

        approved: true,

        decisionId: "DEC-001",

        projectId: "CRM-001"

    });

    assert.ok(plan.planId);

    assert.equal(plan.projectId, "CRM-001");

    assert.equal(plan.engineeringTasks.length, 5);

    assert.equal(plan.milestones.length, 3);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" PLANNING ENGINE RESULT");
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