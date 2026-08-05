import assert from "assert";

import TaskPlanner from "./api/planning-engine/task-planner.js";
import DependencyPlanner from "./api/planning-engine/dependency-planner.js";

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
console.log(" DEPENDENCY PLANNER TEST");
console.log("══════════════════════════════════════");
console.log("");

const taskPlanner = new TaskPlanner();

const dependencyPlanner = new DependencyPlanner();

const tasks = taskPlanner.plan({

    approved: true

});

test("dependencies assigned", () => {

    const graph = dependencyPlanner.build(tasks);

    assert.equal(graph.length, 5);

    assert.equal(graph[0].dependsOn.length, 0);

    assert.ok(graph[4].dependsOn.length > 0);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" DEPENDENCY PLANNER RESULT");
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