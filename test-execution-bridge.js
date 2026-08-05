import assert from "assert";

import PlanningEngine
from "./api/planning-engine/planning-engine.js";

import ExecutionBridge
from "./api/planning-engine/execution-bridge.js";

import {
    WorkflowPlanner
}
from "./api/orchestrator/planner.js";

const planningEngine =
    new PlanningEngine();

const planner =
    new WorkflowPlanner();

const bridge =
    new ExecutionBridge(planner);

const plan =
    planningEngine.createPlan({

        approved: true,

        decisionId: "DEC-001",

        projectId: "CRM-001"

    });

const workflow =
    bridge.createWorkflow(plan);

assert.ok(workflow);

assert.ok(workflow.tasks);

assert.ok(workflow.tasks.length > 0);

console.log("");

console.log("══════════════════════════════");

console.log(" EXECUTION BRIDGE");

console.log("══════════════════════════════");

console.log("✅ PASS");

console.log("");