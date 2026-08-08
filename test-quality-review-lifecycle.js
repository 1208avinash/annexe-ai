/*
  ANNEXE AI — Phase 9.6
  Autonomous Quality & Review Lifecycle Contract Test

  Verifies:

  CODING
    |
    v
  TESTING
    |
    v
  REVIEW
    |
    v
  APPROVAL_REQUIRED

  Existing systems only.
  No production integration.
*/


import {
  ProjectStateManager
} from "./lib/orchestrator/state.js";

import {
  TestExecutionAgent
} from "./lib/agents/testing/executor.js";

import {
  CodeReviewAgent
} from "./lib/agents/review/reviewer.js";


console.log("\n════════════════════════════════════════");
console.log("  Phase 9.6 — Quality Review Lifecycle");
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

const projectId = "PHASE9-6-QUALITY-TEST";

const stateManager = new ProjectStateManager();

const testAgent = new TestExecutionAgent();

const reviewAgent = new CodeReviewAgent();


// --------------------------------------------------
// Stage 1 — Enter coding lifecycle
// --------------------------------------------------

console.log("\n── Stage 1 — Coding Lifecycle ─────────────\n");


stateManager.createProjectState(projectId);


stateManager.updateState(
  projectId,
  "ANALYSIS"
);


stateManager.updateState(
  projectId,
  "ARCHITECTURE_READY"
);


stateManager.updateState(
  projectId,
  "TASKS_CREATED"
);


const coding =
  stateManager.updateState(
    projectId,
    "CODING"
  );


assert(
  coding.success === true,
  "Project enters CODING state"
);


// --------------------------------------------------
// Stage 2 — Testing
// --------------------------------------------------

console.log("\n── Stage 2 — Testing Lifecycle ────────────\n");


const testResult =
  testAgent.runTests({

    sandboxId: "SANDBOX-PHASE9-6",

    taskId: "TASK-QUALITY-001",

    department: "backend",

    commands: [
       "pytest"
    ]

  });


assert(
  testResult.success === true,
  "Testing agent completes successfully"
);


const testing =
  stateManager.updateState(
    projectId,
    "TESTING"
  );


assert(
  testing.success === true,
  "Project enters TESTING state"
);


// --------------------------------------------------
// Stage 3 — Review
// --------------------------------------------------

console.log("\n── Stage 3 — Review Lifecycle ─────────────\n");


const review =
  await reviewAgent.reviewCode({

    task: {
      id: "TASK-QUALITY-001"
    },

    files: [
      {
        name: "app.js",
        content: "const app = true;"
      }
    ],

    tests: {
      status: "PASSED",
      coverage: 90,
      errorHandling: true
    },

    architecture: {}

  });


assert(
  review.success === true,
  "Review agent completes successfully"
);


const reviewState =
  stateManager.updateState(
    projectId,
    "REVIEW"
  );


assert(
  reviewState.success === true,
  "Project enters REVIEW state"
);


// --------------------------------------------------
// Stage 4 — Approval lifecycle
// --------------------------------------------------

console.log("\n── Stage 4 — Approval Lifecycle ───────────\n");


const approvalState =
  stateManager.updateState(
    projectId,
    "APPROVAL_REQUIRED"
  );


assert(
  approvalState.success === true,
  "Project enters APPROVAL_REQUIRED state"
);


// --------------------------------------------------
// Result
// --------------------------------------------------

console.log("\n════════════════════════════════════════");

console.log(
  `Phase 9.6 RESULT: ${passed} passed, ${failed} failed`
);

console.log("════════════════════════════════════════\n");


if (failed > 0) {

  process.exit(1);

}