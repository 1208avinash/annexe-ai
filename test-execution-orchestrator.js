import assert from "assert";

import PlanningEngine from "./api/planning-engine/planning-engine.js";
import ExecutionOrchestrator from "./api/execution-orchestrator/execution-orchestrator.js";

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
console.log(" EXECUTION ORCHESTRATOR TEST");
console.log("══════════════════════════════════════");
console.log("");

const planningEngine = new PlanningEngine();

const orchestrator = new ExecutionOrchestrator();

const plan = planningEngine.createPlan({

    approved: true,

    decisionId: "DEC-001",

    projectId: "CRM-001"

});

test("creates execution jobs", () => {

    const jobs = orchestrator.createJobs(plan);

    assert.equal(jobs.length, 5);

    assert.equal(jobs[0].worker, "generation");

    assert.ok(jobs[4].worker);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" EXECUTION ORCHESTRATOR RESULT");
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