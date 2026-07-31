/*
  ANNEXE AI — Debug Approval Service Integration Test
  FILE: test-debug-approval-service.js

  Verifies the complete approval lifecycle:

    DebugResultsManager
            ↓
       ApprovalGate
            ↓
    APPROVED / REJECTED

  READ-ONLY: does not modify any production file.
*/

import { DebugApprovalService } from "./api/orchestrator/debug-approval-service.js";


// ── Helpers ───────────────────────────────────────────────────────────────────

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

const service = new DebugApprovalService();

console.log("\n════════════════════════════════");
console.log("  DEBUG APPROVAL SERVICE — INTEGRATION TEST");
console.log("════════════════════════════════");


// ── Stage 1 — Submit debug case ───────────────────────────────────────────────

section("Stage 1 — Submit debug case");

const submitted = service.submitForApproval({
  projectId: "SERVICE-APPROVAL-001",
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
  submitted.success === true,
  `got success=${submitted.success}, error=${submitted.error}`
);

assert(
  "debugId exists",
  typeof submitted.debugId === "string" && submitted.debugId.length > 0,
  `got debugId=${submitted.debugId}`
);

assert(
  'status === "PENDING_APPROVAL"',
  submitted.status === "PENDING_APPROVAL",
  `got status=${submitted.status}`
);

const { debugId } = submitted;


// ── Stage 2 — Retrieve ────────────────────────────────────────────────────────

section("Stage 2 — Retrieve");

const record = service.get(debugId);

assert(
  "record exists",
  record !== null && record !== undefined
);

assert(
  "projectId matches",
  record?.projectId === "SERVICE-APPROVAL-001",
  `got projectId=${record?.projectId}`
);

assert(
  "diagnosis exists",
  record?.diagnosis !== undefined && record?.diagnosis !== null
);

assert(
  "patchPlan exists",
  Array.isArray(record?.patchPlan),
  `got patchPlan=${JSON.stringify(record?.patchPlan)}`
);


// ── Stage 3 — Approve ─────────────────────────────────────────────────────────

section("Stage 3 — Approve");

const approved = service.approve({ debugId });

assert(
  "success === true",
  approved.success === true,
  `got success=${approved.success}, error=${approved.error}`
);

assert(
  'status === "APPROVED"',
  approved.status === "APPROVED",
  `got status=${approved.status}`
);


// ── Stage 4 — Reject flow ─────────────────────────────────────────────────────

section("Stage 4 — Reject flow");

const submitted2 = service.submitForApproval({
  projectId: "SERVICE-APPROVAL-002",
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

const rejected = service.reject({ debugId: submitted2.debugId });

assert(
  "success === true",
  rejected.success === true,
  `got success=${rejected.success}, error=${rejected.error}`
);

assert(
  'status === "REJECTED"',
  rejected.status === "REJECTED",
  `got status=${rejected.status}`
);


// ── Stage 5 — Invalid ID ──────────────────────────────────────────────────────

section("Stage 5 — Invalid ID");

const invalid = service.approve({ debugId: "UNKNOWN" });

assert(
  "success === false",
  invalid.success === false,
  `got success=${invalid.success}`
);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════");

if (failed === 0) {
  console.log(`✅ ${passed} passed, 0 failed`);
  console.log("DEBUG APPROVAL SERVICE TEST PASSED");
} else {
  console.log(`❌ ${passed} passed, ${failed} failed`);
  console.log("DEBUG APPROVAL SERVICE TEST FAILED");
}

console.log("════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
