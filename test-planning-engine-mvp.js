import assert from "assert";

import PlanningEngine from "./lib/planning-engine/planning-engine.js";

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

        console.error(err);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" PLANNING ENGINE MVP TEST");
console.log("══════════════════════════════════════");
console.log("");

const engine = new PlanningEngine();

let plan;

test("Engineering Plan Generated", () => {

    plan = engine.createPlan({

        approved: true,

        decisionId: "DEC-001",

        projectId: "CRM-001"

    });

    assert.ok(plan.planId);

    assert.equal(plan.projectId, "CRM-001");

});

test("Engineering Tasks Created", () => {

    assert.equal(plan.engineeringTasks.length, 5);

});

test("Milestones Created", () => {

    assert.equal(plan.milestones.length, 3);

});

test("Execution Order Created", () => {

    assert.ok(plan.executionOrder.length > 0);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" PLANNING ENGINE MVP RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");

    console.log("");

    console.log("Planning Engine MVP Operational");

} else {

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");