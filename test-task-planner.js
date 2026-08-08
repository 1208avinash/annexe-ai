import assert from "assert";

import TaskPlanner from "./lib/planning-engine/task-planner.js";

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
console.log(" TASK PLANNER TEST");
console.log("══════════════════════════════════════");
console.log("");

const planner = new TaskPlanner();

test("approved decision generates tasks", () => {

    const tasks = planner.plan({

        approved: true

    });

    assert.equal(tasks.length, 5);

});

test("rejected decision generates no tasks", () => {

    const tasks = planner.plan({

        approved: false

    });

    assert.equal(tasks.length, 0);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" TASK PLANNER RESULT");
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