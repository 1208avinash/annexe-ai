/*
  ANNEXE AI — Phase 9.5
  Workflow Runner State Contract Test

  Verifies lifecycle relationship between:

  ProjectStateManager
        |
        v
  WorkflowRunner

  Contract only.
  No production integration.
*/


import {
  ProjectStateManager
} from "./api/orchestrator/state.js";

import {
  WorkflowRunner
} from "./api/orchestrator/workflow-runner.js";

import {
  WorkflowTaskGenerator
} from "./api/orchestrator/task-generator.js";


console.log("\n════════════════════════════════════════");
console.log("  Phase 9.5 — Workflow Runner State Contract");
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

const projectId = "PHASE9-5-WORKFLOW-STATE-TEST";

const stateManager = new ProjectStateManager();

const taskGenerator = new WorkflowTaskGenerator();

const runner = new WorkflowRunner(
  taskGenerator
);


// --------------------------------------------------
// Stage 1 — Project lifecycle start
// --------------------------------------------------

console.log("\n── Stage 1 — Project Lifecycle ────────────\n");


const created =
  stateManager.createProjectState(projectId);


assert(
  created.state === "CREATED",
  "Project begins in CREATED state"
);


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
// Stage 2 — Workflow preparation
// --------------------------------------------------

console.log("\n── Stage 2 — Workflow Preparation ─────────\n");


stateManager.updateState(
  projectId,
  "ARCHITECTURE_READY"
);


const tasks =
  stateManager.updateState(
    projectId,
    "TASKS_CREATED"
  );


assert(
  tasks.success === true,
  "Project reaches TASKS_CREATED before execution"
);


// --------------------------------------------------
// Stage 3 — Workflow Runner
// --------------------------------------------------

console.log("\n── Stage 3 — Workflow Runner ──────────────\n");


const workflow = {

  id: "WF-PHASE9-5-TEST",

  projectId,

  tasks: [
    {
      id: "TASK-1",
      type: "development",
      agent: "developer_agent",
      priority: "normal",
      workflowId: "WF-PHASE9-5-TEST",
      projectId
    }
  ]

};


const run =
  runner.createRun(workflow);


assert(
  run.success === true,
  "WorkflowRunner creates execution run"
);


assert(
  run.status === "CREATED",
  "Workflow run starts in CREATED status"
);


// --------------------------------------------------
// Stage 4 — Execution state mapping contract
// --------------------------------------------------

console.log("\n── Stage 4 — Execution Mapping ────────────\n");


const running =
  runner.updateRunStatus(
    workflow.id,
    "RUNNING"
  );


assert(
  running.status === "RUNNING",
  "Workflow runner enters RUNNING state"
);


const projectCoding =
  stateManager.updateState(
    projectId,
    "CODING"
  );


assert(
  projectCoding.success === true,
  "Project lifecycle can move to CODING"
);


// --------------------------------------------------
// Stage 5 — Completion
// --------------------------------------------------

console.log("\n── Stage 5 — Completion ───────────────────\n");


const completed =
  runner.updateRunStatus(
    workflow.id,
    "COMPLETED"
  );


assert(
  completed.status === "COMPLETED",
  "Workflow runner completes execution"
);


// --------------------------------------------------
// Result
// --------------------------------------------------

console.log("\n════════════════════════════════════════");

console.log(
  `Phase 9.5 RESULT: ${passed} passed, ${failed} failed`
);

console.log("════════════════════════════════════════\n");


if (failed > 0) {

  process.exit(1);

}