import assert from "assert";

import PlanningEngine from "./lib/planning-engine/planning-engine.js";
import WorkflowAdapter from "./lib/planning-engine/workflow-adapter.js";

const engine = new PlanningEngine();

const adapter = new WorkflowAdapter();

const plan = engine.createPlan({

    approved: true,

    decisionId: "DEC-001",

    projectId: "CRM-001"

});

const workflow = adapter.convert(plan);

assert.equal(workflow.projectId, "CRM-001");

assert.equal(workflow.tasks.length, 5);

console.log("");

console.log("══════════════════════════════");

console.log(" WORKFLOW ADAPTER");

console.log("══════════════════════════════");

console.log("✅ PASS");

console.log("");