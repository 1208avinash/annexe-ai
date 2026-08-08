/*
  ANNEXE AI — Approval Execution Service Test
  FILE: test-approval-execution-service.js
  Phase 8.2.2

  Verifies ApprovalExecutionService orchestration only:
    1. Load approval record
    2. Verify APPROVED
    3. Call RepairCoordinator
    4. Return result unchanged
*/

import { ApprovalExecutionService } from "./lib/orchestrator/approval-execution-service.js";
import { DebugApprovalService }     from "./lib/orchestrator/debug-approval-service.js";
import { RepairCoordinator }        from "./lib/orchestrator/repair-coordinator.js";


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

const PROJECT_ID = "PROJECT-APPROVAL-001";
const DIAGNOSIS  = { status: "critical", errors: [{ errorId: "BUILD_FAILED", message: "Build failed" }] };
const PATCH_PLAN = [{ action: "replace_file", path: "src/index.js", content: "// patched" }];

// Shared real approval service — used across all stages
const approvalService = new DebugApprovalService();


console.log("\n══════════════════════════════════════════════════");
console.log("  APPROVAL EXECUTION SERVICE TEST");
console.log("══════════════════════════════════════════════════");


// ── Stage 1 — Missing debugId ─────────────────────────────────────────────────

section("Stage 1 — Missing debugId");

const svc1 = new ApprovalExecutionService({
  debugApprovalService: approvalService,
  repairCoordinator:    new RepairCoordinator()
});

const r1 = await svc1.executeApprovedRepair({});

assert("success === false",   r1.success === false,       `got ${r1.success}`);
assert("status NOT_FOUND",    r1.status  === "NOT_FOUND", `got ${r1.status}`);


// ── Stage 2 — Unknown debugId ─────────────────────────────────────────────────

section("Stage 2 — Unknown debugId");

const r2 = await svc1.executeApprovedRepair({ debugId: "UNKNOWN" });

assert("success === false",   r2.success === false,       `got ${r2.success}`);
assert("status NOT_FOUND",    r2.status  === "NOT_FOUND", `got ${r2.status}`);


// ── Stage 3 — Pending approval ────────────────────────────────────────────────

section("Stage 3 — Pending approval");

const pending = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: DIAGNOSIS,
  patchPlan: PATCH_PLAN
});
// deliberately NOT approved

const r3 = await svc1.executeApprovedRepair({ debugId: pending.debugId });

assert("success === false",    r3.success === false,          `got ${r3.success}`);
assert("status NOT_APPROVED",  r3.status  === "NOT_APPROVED", `got ${r3.status}`);


// ── Stage 4 — Rejected approval ───────────────────────────────────────────────

section("Stage 4 — Rejected approval");

const toReject = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: DIAGNOSIS,
  patchPlan: PATCH_PLAN
});
approvalService.reject({ debugId: toReject.debugId });

const r4 = await svc1.executeApprovedRepair({ debugId: toReject.debugId });

assert("success === false",    r4.success === false,          `got ${r4.success}`);
assert("status NOT_APPROVED",  r4.status  === "NOT_APPROVED", `got ${r4.status}`);


// ── Stage 5 — Approved → BUILD_SUCCESS ───────────────────────────────────────

section("Stage 5 — Approved → BUILD_SUCCESS");

// Track RepairCoordinator.repair() calls
let repairCallCount = 0;
let repairCallInput = null;

const mockCoordSuccess = {
  async repair(input) {
    repairCallCount++;
    repairCallInput = input;
    return { success: true, status: "BUILD_SUCCESS", projectId: input.projectId, attempt: 1 };
  }
};

const toApprove = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: DIAGNOSIS,
  patchPlan: PATCH_PLAN
});
approvalService.approve({ debugId: toApprove.debugId });

const svc5 = new ApprovalExecutionService({
  debugApprovalService: approvalService,
  repairCoordinator:    mockCoordSuccess
});

const r5 = await svc5.executeApprovedRepair({ debugId: toApprove.debugId });

assert("RepairCoordinator.repair() called once",  repairCallCount === 1,              `called ${repairCallCount} times`);
assert("projectId passed correctly",              repairCallInput?.projectId === PROJECT_ID, `got ${repairCallInput?.projectId}`);
assert("patchPlan passed correctly",              JSON.stringify(repairCallInput?.patchPlan) === JSON.stringify(PATCH_PLAN), `got ${JSON.stringify(repairCallInput?.patchPlan)}`);
assert("success === true",                        r5.success === true,                `got ${r5.success}`);
assert("status BUILD_SUCCESS",                    r5.status  === "BUILD_SUCCESS",     `got ${r5.status}`);
assert("result returned unchanged",               r5.attempt === 1,                   `got ${r5.attempt}`);


// ── Stage 6 — Approved → BUILD_FAILED (result unchanged) ─────────────────────

section("Stage 6 — BUILD_FAILED returned unchanged");

const mockCoordFail = {
  async repair(input) {
    return { success: false, status: "BUILD_FAILED", projectId: input.projectId,
             attempt: 1, attemptsUsed: 1, attemptsRemaining: 2, error: "compile error" };
  }
};

const toApproveFail = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: DIAGNOSIS,
  patchPlan: PATCH_PLAN
});
approvalService.approve({ debugId: toApproveFail.debugId });

const svc6 = new ApprovalExecutionService({
  debugApprovalService: approvalService,
  repairCoordinator:    mockCoordFail
});

const r6 = await svc6.executeApprovedRepair({ debugId: toApproveFail.debugId });

assert("success === false",             r6.success === false,          `got ${r6.success}`);
assert("status BUILD_FAILED",           r6.status  === "BUILD_FAILED", `got ${r6.status}`);
assert("attemptsRemaining preserved",   r6.attemptsRemaining === 2,    `got ${r6.attemptsRemaining}`);
assert("error preserved",               r6.error   === "compile error", `got ${r6.error}`);


// ── Stage 7 — Approved → MAX_ATTEMPTS_REACHED (result unchanged) ──────────────

section("Stage 7 — MAX_ATTEMPTS_REACHED returned unchanged");

const mockCoordMax = {
  async repair(input) {
    return { success: false, status: "MAX_ATTEMPTS_REACHED", projectId: input.projectId,
             attempts: 3, maxAttempts: 3 };
  }
};

const toApproveMax = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: DIAGNOSIS,
  patchPlan: PATCH_PLAN
});
approvalService.approve({ debugId: toApproveMax.debugId });

const svc7 = new ApprovalExecutionService({
  debugApprovalService: approvalService,
  repairCoordinator:    mockCoordMax
});

const r7 = await svc7.executeApprovedRepair({ debugId: toApproveMax.debugId });

assert("success === false",                  r7.success  === false,                   `got ${r7.success}`);
assert("status MAX_ATTEMPTS_REACHED",        r7.status   === "MAX_ATTEMPTS_REACHED",  `got ${r7.status}`);
assert("attempts preserved",                 r7.attempts === 3,                        `got ${r7.attempts}`);
assert("maxAttempts preserved",              r7.maxAttempts === 3,                     `got ${r7.maxAttempts}`);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════");

if (failed === 0) {
  console.log(`✅ ${passed} passed`);
  console.log(`0 failed`);
  console.log("APPROVAL EXECUTION SERVICE TEST PASSED");
} else {
  console.log(`❌ ${passed} passed`);
  console.log(`${failed} failed`);
  console.log("APPROVAL EXECUTION SERVICE TEST FAILED");
}

console.log("══════════════════════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
