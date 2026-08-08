/*
  ANNEXE AI — Phase 9.5.1
  Project Execution Lifecycle Bridge Contract Test

  Purpose:

  Verify the expected relationship between:

  ProjectStateManager
          |
          v
  Workflow lifecycle components

  Contract only.
  No production integration.
*/


import {
  ProjectStateManager
} from "./lib/orchestrator/state.js";

import {
  WorkflowManager
} from "./lib/orchestrator/workflow.js";

import {
  WorkflowTaskGenerator
} from "./lib/orchestrator/task-generator.js";

import {
  WorkflowRunner
} from "./lib/orchestrator/workflow-runner.js";


console.log("\n════════════════════════════════════════");
console.log("  Phase 9.5.1 — Execution Lifecycle Bridge");
console.log("════════════════════════════════════════\n");


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
// Setup
// --------------------------------------------------

const projectId = "PHASE9-5-1-BRIDGE-TEST";

const stateManager = new ProjectStateManager();

const workflowManager = new WorkflowManager();

const runner = new WorkflowRunner(
  new WorkflowTaskGenerator()
);


// --------------------------------------------------
// Stage 1 — Project lifecycle creation
// --------------------------------------------------

console.log("\n── Stage 1 — Project Lifecycle ────────────\n");


const created =
  stateManager.createProjectState(projectId);


assert(
  created.state === "CREATED",
  "Project lifecycle starts at CREATED"
);


// --------------------------------------------------
// Stage 2 — Workflow readiness
// --------------------------------------------------

console.log("\n── Stage 2 — Workflow Readiness ───────────\n");


stateManager.updateState(
  projectId,
  "ANALYSIS"
);


stateManager.updateState(
  projectId,
  "ARCHITECTURE_READY"
);


const taskState =
  stateManager.updateState(
    projectId,
    "TASKS_CREATED"
  );


assert(
  taskState.success === true,
  "Project reaches TASKS_CREATED before execution"
);


// --------------------------------------------------
// Stage 3 — Workflow creation
// --------------------------------------------------

console.log("\n── Stage 3 — Workflow Creation ────────────\n");


const workflow =
  workflowManager.createWorkflow(
    projectId,
    {
      projectId,
      tasks: [
        {
          id: "TASK-1",
          name: "Build application",
          agent: "developer_agent"
        }
      ]
    }
  );


assert(
  workflow &&
  workflow.projectId === projectId,
  "Workflow is attached to project"
);


// --------------------------------------------------
// Stage 4 — Execution start contract
// --------------------------------------------------

console.log("\n── Stage 4 — Execution Start ──────────────\n");


const run =
  runner.createRun(workflow);


assert(
  run.success === true,
  "WorkflowRunner creates execution run"
);


const running =
  runner.updateRunStatus(
    workflow.id,
    "RUNNING"
  );


assert(
  running.status === "RUNNING",
  "Workflow execution enters RUNNING"
);


// Future bridge expectation:
// RUNNING should map to project CODING

const coding =
  stateManager.updateState(
    projectId,
    "CODING"
  );


assert(
  coding.success === true,
  "Project lifecycle enters CODING"
);


// --------------------------------------------------
// Stage 5 — Execution completion contract
// --------------------------------------------------

console.log("\n── Stage 5 — Execution Completion ─────────\n");


const completed =
  runner.updateRunStatus(
    workflow.id,
    "COMPLETED"
  );


assert(
  completed.status === "COMPLETED",
  "Workflow execution completes"
);


// Future bridge expectation:
// COMPLETED should map to project TESTING

const testing =
  stateManager.updateState(
    projectId,
    "TESTING"
  );


assert(
  testing.success === true,
  "Project lifecycle enters TESTING"
);


// --------------------------------------------------
// Result
// --------------------------------------------------

console.log("\n════════════════════════════════════════");

console.log(
  `Phase 9.5.1 RESULT: ${passed} passed, ${failed} failed`
);

console.log("════════════════════════════════════════\n");


if (failed > 0) {

  process.exit(1);

}