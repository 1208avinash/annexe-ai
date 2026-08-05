import assert from "assert";

import ExecutionJob from "./api/execution-orchestrator/contracts/execution-job.js";
import TaskDispatcher from "./api/execution-orchestrator/task-dispatcher.js";

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
console.log(" TASK DISPATCHER TEST");
console.log("══════════════════════════════════════");
console.log("");

const dispatcher = new TaskDispatcher();

test("dispatches execution job", () => {

    const job = new ExecutionJob({

        jobId: "JOB-001",

        worker: "generation"

    });

    const result = dispatcher.dispatch(job);

    assert.equal(result.jobId, "JOB-001");

    assert.equal(result.worker, "generation");

    assert.equal(result.status, "DISPATCHED");

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" TASK DISPATCHER RESULT");
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