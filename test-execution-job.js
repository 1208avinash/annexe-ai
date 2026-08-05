import assert from "assert";

import ExecutionJob from "./api/execution-orchestrator/contracts/execution-job.js";

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
console.log(" EXECUTION JOB TEST");
console.log("══════════════════════════════════════");
console.log("");

test("creates execution job", () => {

    const job = new ExecutionJob({

        jobId: "JOB-001",

        planId: "PLAN-001",

        projectId: "CRM-001",

        taskId: "TASK-001",

        worker: "generation"

    });

    assert.equal(job.worker, "generation");

    assert.equal(job.status, "PENDING");

});

test("toJSON works", () => {

    const job = new ExecutionJob();

    assert.ok(job.toJSON());

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" EXECUTION JOB RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

if (failed === 0) {

    console.log("");
    console.log("✅ PASS");

} else {

    console.log("");
    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");