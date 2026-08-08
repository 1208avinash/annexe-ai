import assert from "assert";

import TaskPlanner from "./lib/planning-engine/task-planner.js";
import DependencyPlanner from "./lib/planning-engine/dependency-planner.js";
import SprintPlanner from "./lib/planning-engine/sprint-planner.js";

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
console.log(" SPRINT PLANNER TEST");
console.log("══════════════════════════════════════");
console.log("");

const taskPlanner = new TaskPlanner();

const dependencyPlanner = new DependencyPlanner();

const sprintPlanner = new SprintPlanner();

const tasks = taskPlanner.plan({

    approved: true

});

const dependencyGraph =
    dependencyPlanner.build(tasks);

test("sprints created", () => {

    const sprints =
        sprintPlanner.plan(dependencyGraph);

    assert.equal(sprints.length, 3);

    assert.equal(sprints[0].tasks.length, 1);

    assert.ok(sprints[1].tasks.length > 0);

    assert.equal(sprints[2].tasks.length, 1);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" SPRINT PLANNER RESULT");
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