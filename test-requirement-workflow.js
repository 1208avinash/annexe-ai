// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-6.1
// Requirement Workflow Integration Test
// ───────────────────────────────────────────────────────────────

import { WorkflowPlanner } from "./api/orchestrator/planner.js";

let passed = 0;
let failed = 0;

function assert(name, condition, actual = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    } else {

        console.log(`❌ ${name}`);

        if (actual !== null)
            console.log(actual);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" REQUIREMENT WORKFLOW TEST");
console.log("══════════════════════════════════════");
console.log("");

const planner = new WorkflowPlanner();

const workflow = planner.createWorkflowPlan({

    id: "PROJECT-RC6",

    type: "saas",

    title: "CRM Platform"

});

assert(

    "workflow created",

    workflow !== null,

    workflow

);

assert(

    "contains phases",

    Array.isArray(workflow.phases),

    workflow

);

assert(

    "first phase is Requirement Intelligence",

    workflow.phases[0].agent === "requirement_intelligence_agent",

    workflow.phases[0]

);

assert(

    "architecture follows",

    workflow.phases[1].agent === "architect_agent",

    workflow.phases[1]

);

console.log("");
console.log("══════════════════════════════════════");
console.log(" REQUIREMENT WORKFLOW RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");
    console.log("");
    console.log("Requirement workflow verified.");

} else {

    console.log("❌ FAIL");

}

console.log("");
console.log("══════════════════════════════════════");