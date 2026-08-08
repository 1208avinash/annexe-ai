/*
  ANNEXE AI — Debug Approval Gate Integration Test
  FILE: test-debug-approval-gate.js

  Proves the safety layer between Debug Worker output
  and future patch execution:

    Debug Result
          ↓
    DebugResultsManager
          ↓
    ApprovalGate
          ↓
    APPROVED / REJECTED

  READ-ONLY: does not modify any production file.
*/

import { DebugResultsManager } from "./debug-results.js";
import { ApprovalGate }        from "./approval-gate.js";


// ── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, extra = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${extra ? " — " + extra : ""}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n  ── ${title} ──`);
}


// ── Setup ─────────────────────────────────────────────────────────────────────

const store       = new DebugResultsManager();
const approvalGate = new ApprovalGate(store);

console.log("\n════════════════════════════════");
console.log("  DEBUG APPROVAL GATE — INTEGRATION TEST");
console.log("════════════════════════════════");


// ── Stage 1 — Create debug result ─────────────────────────────────────────────

section("Stage 1 — Create debug result");

const created = store.createDebugResult({
  projectId: "APPROVAL-TEST-001",
  diagnosis: {
    status: "critical",
    errors: [
      {
        errorId: "BUILD_FAILED",
        message: "Build failed"
      }
    ]
  },
  patchPlan: [
    {
      patchId: "PATCH-001",
      action:  "diagnose-build"
    }
  ]
});

assert(
  "success === true",
  created.success === true,
  `got success=${created.success}, error=${created.error}`
);

assert(
  "debugId exists",
  typeof created.debugId === "string" && created.debugId.length > 0,
  `got debugId=${created.debugId}`
);

assert(
  "status === PENDING_APPROVAL",
  created.status === "PENDING_APPROVAL",
  `got status=${created.status}`
);

const { debugId } = created;


// ── Stage 2 — Retrieve result ─────────────────────────────────────────────────

section("Stage 2 — Retrieve result");

const record = store.getDebugResult(debugId);

assert(
  "record exists",
  record !== null && record !== undefined
);

assert(
  "projectId matches",
  record?.projectId === "APPROVAL-TEST-001",
  `got projectId=${record?.projectId}`
);

assert(
  "patchPlan exists",
  Array.isArray(record?.patchPlan),
  `got patchPlan=${JSON.stringify(record?.patchPlan)}`
);


// ── Stage 3 — Approve ─────────────────────────────────────────────────────────

section("Stage 3 — Approve");

const approveResult = approvalGate.approve({
  debugId,
  decision: "APPROVE"
});

assert(
  "success === true",
  approveResult.success === true,
  `got success=${approveResult.success}, error=${approveResult.error}`
);

assert(
  "approved === true",
  approveResult.approved === true,
  `got approved=${approveResult.approved}`
);

assert(
  "status === APPROVED",
  approveResult.status === "APPROVED",
  `got status=${approveResult.status}`
);


// ── Stage 4 — Reject flow ─────────────────────────────────────────────────────

section("Stage 4 — Reject flow");

const created2 = store.createDebugResult({
  projectId: "APPROVAL-TEST-002",
  diagnosis: {
    status: "critical",
    errors: [
      {
        errorId: "BUILD_FAILED",
        message: "Build failed"
      }
    ]
  },
  patchPlan: [
    {
      patchId: "PATCH-002",
      action:  "diagnose-build"
    }
  ]
});

const rejectResult = approvalGate.approve({
  debugId:  created2.debugId,
  decision: "REJECT"
});

assert(
  "approved === false",
  rejectResult.approved === false,
  `got approved=${rejectResult.approved}`
);

assert(
  "status === REJECTED",
  rejectResult.status === "REJECTED",
  `got status=${rejectResult.status}`
);


// ── Stage 5 — Invalid decision ────────────────────────────────────────────────

section("Stage 5 — Invalid decision");

const created3 = store.createDebugResult({
  projectId: "APPROVAL-TEST-003",
  diagnosis: { status: "critical", errors: [] },
  patchPlan: []
});

const invalidResult = approvalGate.approve({
  debugId:  created3.debugId,
  decision: "MAYBE"
});

assert(
  "success === false",
  invalidResult.success === false,
  `got success=${invalidResult.success}`
);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════");

if (failed === 0) {
  console.log(`✅ ${passed} passed, 0 failed`);
  console.log("DEBUG APPROVAL GATE TEST PASSED");
} else {
  console.log(`❌ ${passed} passed, ${failed} failed`);
  console.log("DEBUG APPROVAL GATE TEST FAILED");
}

console.log("════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
