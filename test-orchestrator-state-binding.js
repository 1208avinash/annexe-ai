/*
  ANNEXE AI — Phase 9.4.1
  Orchestrator Lifecycle Binding Contract Test

  Purpose:
  Verify that project lifecycle ownership can be connected
  at the orchestration layer.

  This test does NOT modify production code.
*/

import {
  ProjectStateManager
} from "./api/orchestrator/state.js";

import {
  WorkflowPlanner
} from "./api/orchestrator/planner.js";

import {
  WorkflowManager
} from "./api/orchestrator/workflow.js";


console.log("\n════════════════════════════════════════");
console.log("  Phase 9.4.1 — Orchestrator State Binding");
console.log("════════════════════════════════════════\n");


const stateManager = new ProjectStateManager();
const planner = new WorkflowPlanner();
const workflowManager = new WorkflowManager();


let passed = 0;
let failed = 0;


function assert(condition, message) {

  if (condition) {

    console.log("✅", message);
    passed++;

  } else {

    console.log("❌", message);
    failed++;

  }

}


// --------------------------------------------------
// Stage 1 — Create project lifecycle
// --------------------------------------------------

console.log("\n── Stage 1 — Project Creation ─────────────\n");


const projectId = "PHASE9-4-1-STATE-TEST";


const created =
  stateManager.createProjectState(projectId);


assert(
  created.state === "CREATED",
  "Project starts in CREATED state"
);


// --------------------------------------------------
// Stage 2 — Analysis lifecycle
// --------------------------------------------------

console.log("\n── Stage 2 — Analysis Phase ───────────────\n");


const analysis =
  stateManager.updateState(
    projectId,
    "ANALYSIS"
  );


assert(
  analysis.success === true,
  "Project moves to ANALYSIS"
);


// --------------------------------------------------
// Stage 3 — Workflow planning
// --------------------------------------------------

console.log("\n── Stage 3 — Workflow Planning ────────────\n");


const project = {
  id: projectId,
  name: "Lifecycle Test Project",
  requirements: [
    "Create application"
  ]
};


const plan =
  planner.createWorkflowPlan(project);


assert(
  plan &&
  plan.tasks &&
  Array.isArray(plan.tasks),
  "Workflow planner creates tasks"
);


// --------------------------------------------------
// Stage 4 — Task lifecycle
// --------------------------------------------------

console.log("\n── Stage 4 — Task Lifecycle ───────────────\n");


const tasksCreated =
  stateManager.updateState(
    projectId,
    "ARCHITECTURE_READY"
  );


assert(
  tasksCreated.success === true,
  "Project moves to ARCHITECTURE_READY"
);


const taskState =
  stateManager.updateState(
    projectId,
    "TASKS_CREATED"
  );


assert(
  taskState.success === true,
  "Project moves to TASKS_CREATED"
);


// --------------------------------------------------
// Stage 5 — Verify workflow manager compatibility
// --------------------------------------------------

console.log("\n── Stage 5 — Workflow Manager ─────────────\n");


const workflow =
  workflowManager.createWorkflow(
    projectId,
    plan
  );


assert(
  workflow &&
  workflow.projectId === projectId,
  "Workflow manager accepts planned workflow"
);


// --------------------------------------------------
// Result
// --------------------------------------------------

console.log("\n════════════════════════════════════════");

console.log(
  `Phase 9.4.1 RESULT: ${passed} passed, ${failed} failed`
);

console.log("════════════════════════════════════════\n");


if (failed > 0) {

  process.exit(1);

}