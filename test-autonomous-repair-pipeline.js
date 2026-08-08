// ── ANNEXE AI — End-to-End Autonomous Repair Pipeline Test ───────────────────
//
// Place at project root and run:
//   node test-autonomous-repair-pipeline.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { ApprovalExecutionService   } from "./lib/orchestrator/approval-execution-service.js";
import { DebugApprovalService       } from "./lib/orchestrator/debug-approval-service.js";
import { RepairCoordinator          } from "./lib/orchestrator/repair-coordinator.js";
import { RebuildVerificationService } from "./lib/orchestrator/rebuild-verification-service.js";
import { RepairExecutionService     } from "./lib/orchestrator/repair-execution-service.js";
import { PatchExecutor              } from "./lib/orchestrator/patch-executor.js";


// ── Assertion helper ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual) {
  const icon = condition ? "✅" : "❌";
  console.log(`${icon}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  if (condition) passed++; else failed++;
  return condition;
}


// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROJECT_ID = "ANNEXE-REPAIR-TEST-001";

const PATCH_PLAN = {
  patchId:     "patch-001",
  targetFile:  "api/agents/backend/engineer.js",
  description: "Fix missing null guard in service builder",
  changes: [
    {
      line:     42,
      original: "return services.map(s => s.build());",
      patched:  "return (services || []).map(s => s.build());"
    }
  ]
};

const BUILD_FAILED_EVENT = {
  projectId: PROJECT_ID,
  status:    "BUILD_FAILED",
  error:     "TypeError: Cannot read properties of undefined (reading 'map')",
  file:      "api/agents/backend/engineer.js",
  line:      42,
  attempt:   1,
  patchPlan: PATCH_PLAN
};

let debugId = null;   // captured from submitForApproval, reused across all stages


// ── Instances ─────────────────────────────────────────────────────────────────

const patchExecutor = new PatchExecutor();

const repairExecutionService = new RepairExecutionService({
  patchExecutor
});

const rebuildVerificationService = new RebuildVerificationService({
  repairExecutionService
});

const repairCoordinator = new RepairCoordinator({
  verifier: rebuildVerificationService
});

const debugApprovalService = new DebugApprovalService();

const approvalExecutionService = new ApprovalExecutionService({
  debugApprovalService,
  repairCoordinator
});


// ── Stage 1 — submitForApproval → get() → verify stored record ────────────────

async function runStage1() {

  console.log("\n── Stage 1: Simulate BUILD_FAILED → submit for approval ─────────\n");

  const submitted = await debugApprovalService.submitForApproval(BUILD_FAILED_EVENT);
  
  console.log("\n===== BUILD_FAILED_EVENT =====");
  console.dir(BUILD_FAILED_EVENT, { depth: null });

  console.log("\n===== submitForApproval() returned =====");
  console.dir(submitted, { depth: null });
  console.log("========================================\n");

  assert("submitted.success === true",        submitted?.success === true,              submitted?.success);
  assert("submitted.debugId exists",          !!submitted?.debugId,                    submitted?.debugId);
  assert("submitted.status is PENDING_APPROVAL", submitted?.status === "PENDING_APPROVAL", submitted?.status);

  debugId = submitted.debugId;

  const record = await debugApprovalService.get(debugId);

  assert("record exists in store",            !!record,                                null);
  assert("record.projectId preserved",        record?.projectId === PROJECT_ID,        record?.projectId);
  assert("record.patchPlan preserved",        !!record?.patchPlan,                     null);
  assert("record.status is PENDING_APPROVAL", record?.status === "PENDING_APPROVAL",   record?.status);

}


// ── Stage 2 — approve → verify success and status ────────────────────────────

async function runStage2() {

  console.log("\n── Stage 2: Approve debug record ────────────────────────────────\n");

  const approved = await debugApprovalService.approve({ debugId });

  assert("approved.success === true",  approved?.success === true,       approved?.success);
  assert("approved.status is APPROVED", approved?.status === "APPROVED", approved?.status);

}


// ── Stage 3 — Mock repair() → BUILD_SUCCESS → executeApprovedRepair ───────────

async function runStage3() {

  console.log("\n── Stage 3: Mock BUILD_SUCCESS → executeApprovedRepair ──────────\n");

  let repairCallCount  = 0;
  let repairCalledWith = null;

  const originalRepair = repairCoordinator.repair.bind(repairCoordinator);

  repairCoordinator.repair = async (payload) => {
    repairCallCount++;
    repairCalledWith = payload;
    return { status: "BUILD_SUCCESS", projectId: payload.projectId };
  };

  const result = await approvalExecutionService.executeApprovedRepair({ debugId });

  repairCoordinator.repair = originalRepair;

  assert("repair() called once",       repairCallCount === 1,                                       repairCallCount);
  assert("projectId forwarded",        repairCalledWith?.projectId === PROJECT_ID,                  repairCalledWith?.projectId);
  assert("patchPlan forwarded",        !!repairCalledWith?.patchPlan,                              null);
  assert("BUILD_SUCCESS returned",     result?.status === "BUILD_SUCCESS",                         result?.status);

}


// ── Stage 4 — Mock repair() → BUILD_FAILED → returned unchanged ───────────────

async function runStage4() {

  console.log("\n── Stage 4: Mock BUILD_FAILED → returned unchanged ──────────────\n");

  const originalRepair = repairCoordinator.repair.bind(repairCoordinator);

  repairCoordinator.repair = async (payload) => {
    return { status: "BUILD_FAILED", projectId: payload.projectId };
  };

  const result = await approvalExecutionService.executeApprovedRepair({ debugId });

  repairCoordinator.repair = originalRepair;

  assert("BUILD_FAILED returned unchanged", result?.status === "BUILD_FAILED", result?.status);

}


// ── Stage 5 — Mock repair() → MAX_ATTEMPTS_REACHED → returned unchanged ───────

async function runStage5() {

  console.log("\n── Stage 5: Mock MAX_ATTEMPTS_REACHED → returned unchanged ──────\n");

  const originalRepair = repairCoordinator.repair.bind(repairCoordinator);

  repairCoordinator.repair = async (payload) => {
    return { status: "MAX_ATTEMPTS_REACHED", projectId: payload.projectId };
  };

  const result = await approvalExecutionService.executeApprovedRepair({ debugId });

  repairCoordinator.repair = originalRepair;

  assert("MAX_ATTEMPTS_REACHED returned unchanged", result?.status === "MAX_ATTEMPTS_REACHED", result?.status);

}


// ── Stage 6 — Verify stored record integrity ──────────────────────────────────

async function runStage6() {

  console.log("\n── Stage 6: Verify debug store integrity ────────────────────────\n");

  const record = await debugApprovalService.get(debugId);

  assert("record exists",             !!record,                          null);
  assert("status is APPROVED",        record?.status === "APPROVED",     record?.status);
  assert("projectId unchanged",       record?.projectId === PROJECT_ID,  record?.projectId);

}


// ── Runner ────────────────────────────────────────────────────────────────────

async function run() {

  console.log("\n════════════════════════════════════════════════════════════════");
  console.log("  ANNEXE AI");
  console.log("  END TO END AUTONOMOUS REPAIR PIPELINE");
  console.log("════════════════════════════════════════════════════════════════");

  const stages = [
    { label: "Stage 1", fn: runStage1 },
    { label: "Stage 2", fn: runStage2 },
    { label: "Stage 3", fn: runStage3 },
    { label: "Stage 4", fn: runStage4 },
    { label: "Stage 5", fn: runStage5 },
    { label: "Stage 6", fn: runStage6 }
  ];

  for (const stage of stages) {
    try {
      await stage.fn();
      console.log(`\n  ${stage.label} ✅`);
    } catch (e) {
      console.log(`\n  ${stage.label} ❌ — ${e.message}`);
      failed++;
    }
  }

  console.log("\n════════════════════════════════════════════════════════════════");
  console.log(`  ${passed} passed`);
  console.log(`  ${failed} failed`);

  if (failed === 0) {
    console.log("  AUTONOMOUS REPAIR PIPELINE PASSED");
  } else {
    console.log("  AUTONOMOUS REPAIR PIPELINE FAILED");
  }

  console.log("════════════════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);

}

run().catch(err => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
