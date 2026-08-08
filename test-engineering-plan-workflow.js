import assert from "assert";

import PlanningEngine from "./lib/planning-engine/planning-engine.js";
import { WorkflowPlanner } from "./lib/orchestrator/planner.js";

const planningEngine = new PlanningEngine();

const planner = new WorkflowPlanner();

const plan = planningEngine.createPlan({

    approved: true,

    decisionId: "DEC-001",

    projectId: "CRM-001"

});

const workflow =
    planner.createWorkflowFromEngineeringPlan(plan);

assert.equal(

    workflow.tasks.length,

    plan.engineeringTasks.length

);

assert.equal(

    workflow.phases.length,

    plan.milestones.length

);

console.log("");

console.log("════════════════════════════════");

console.log(" ENGINEERING PLAN → WORKFLOW");

console.log("════════════════════════════════");

console.log("✅ PASS");

console.log("");