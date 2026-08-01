/*
  ANNEXE AI — Phase 9.4
  Project State Lifecycle Contract Test

  Verifies:
  ProjectStateManager lifecycle transitions

  No production integration.
  Contract verification only.
*/

import {
  ProjectStateManager,
  PROJECT_STATES
} from "./api/orchestrator/state.js";


console.log("\n════════════════════════════════════════");
console.log("  Phase 9.4 — Project State Lifecycle");
console.log("════════════════════════════════════════\n");


const manager = new ProjectStateManager();

const projectId = "PHASE9-4-LIFECYCLE-TEST";

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
// Stage 1 — Project creation
// --------------------------------------------------

console.log("\n── Stage 1 — Project Creation ─────────────\n");


const created = manager.createProjectState(projectId);


assert(
  created.state === "CREATED",
  "Project starts in CREATED state"
);


// --------------------------------------------------
// Stage 2 — Full lifecycle
// --------------------------------------------------

console.log("\n── Stage 2 — Lifecycle Transitions ─────────\n");


const lifecycle = [
  "ANALYSIS",
  "ARCHITECTURE_READY",
  "TASKS_CREATED",
  "CODING",
  "TESTING",
  "REVIEW",
  "APPROVAL_REQUIRED",
  "DELIVERED"
];


for (const nextState of lifecycle) {

  const result = manager.updateState(
    projectId,
    nextState
  );


  assert(
    result.success === true &&
    result.state === nextState,
    `Transition to ${nextState}`
  );

}


// --------------------------------------------------
// Stage 3 — Invalid transition protection
// --------------------------------------------------

console.log("\n── Stage 3 — Invalid Transition ────────────\n");


const invalid = manager.updateState(
  projectId,
  "CODING"
);


assert(
  invalid.success === false,
  "Delivered project cannot return to CODING"
);


// --------------------------------------------------
// Stage 4 — History verification
// --------------------------------------------------

console.log("\n── Stage 4 — History Verification ─────────\n");


const history = manager.getHistory(projectId);


assert(
  history.length === lifecycle.length,
  "History records every lifecycle transition"
);


assert(
  history[0].from === "CREATED" &&
  history[0].to === "ANALYSIS",
  "History preserves transition order"
);


// --------------------------------------------------
// Result
// --------------------------------------------------

console.log("\n════════════════════════════════════════");

console.log(
  `Phase 9.4 RESULT: ${passed} passed, ${failed} failed`
);

console.log("════════════════════════════════════════\n");


if (failed > 0) {

  process.exit(1);

}