// ── ANNEXE AI — Repair Execution Service Test ─────────────────────────────────
//
// Phase 7.2
//
// Proves:
//   APPROVED debug repair
//           |
//           v
//   RepairExecutionService
//           |
//           v
//   PatchExecutor → Sandbox Files Modified
//
// All internal dependencies of DebugApprovalService (DebugResultsManager,
// ApprovalGate) are mocked so the test is self-contained and does not
// require debug-results.js or approval-gate.js at runtime.
//
// Stages:
//   1. Approved repair   — full happy path, file content verified
//   2. Not approved      — PENDING_APPROVAL blocked at gate
//   3. Invalid debugId   — unknown record rejected
//   4. Cleanup           — sandbox removed from manager
//
// Run:
//   node test-repair-execution-service.js
//
// ─────────────────────────────────────────────────────────────────────────────

import path from "path";
import fs   from "fs/promises";
import os   from "os";

import { RepairExecutionService } from "./lib/orchestrator/repair-execution-service.js";
import { PatchExecutor }          from "./lib/orchestrator/patch-executor.js";
import { SandboxManager }         from "./lib/sandbox/manager.js";


// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_ID   = "REPAIR-EXEC-TEST-001";
const SANDBOX_ROOT = path.join(os.tmpdir(), "annexe-repair-exec-" + Date.now());


// ── Test harness ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}


// ── Mock DebugApprovalService ─────────────────────────────────────────────────
//
// Replaces DebugApprovalService (and its internal DebugResultsManager +
// ApprovalGate dependencies) with a minimal in-memory stub that exposes
// the same API surface used by RepairExecutionService:
//
//   submitForApproval({ projectId, diagnosis, patchPlan }) → { success, debugId, status }
//   approve({ debugId })                                   → { success, debugId, status }
//   get(debugId)                                           → record | null

class MockDebugApprovalService {

  constructor() {
    this._store  = new Map();
    this._nextId = 1;
  }

  submitForApproval({ projectId, diagnosis, patchPlan } = {}) {

    if (!projectId || !diagnosis || !Array.isArray(patchPlan)) {
      return { success: false, error: "Invalid input" };
    }

    const debugId = "DEBUG-" + String(this._nextId++).padStart(3, "0");

    this._store.set(debugId, {
      debugId,
      projectId,
      diagnosis,
      patchPlan,
      status: "PENDING_APPROVAL"
    });

    return { success: true, debugId, status: "PENDING_APPROVAL" };

  }

  approve({ debugId } = {}) {

    const record = this._store.get(debugId);

    if (!record) {
      return { success: false, error: `No record for debugId: ${debugId}` };
    }

    record.status = "APPROVED";

    return { success: true, debugId, status: "APPROVED" };

  }

  get(debugId) {
    return this._store.get(debugId) || null;
  }

}


// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap() {

  // Real filesystem sandbox
  await fs.mkdir(path.join(SANDBOX_ROOT, "src"), { recursive: true });

  await fs.writeFile(
    path.join(SANDBOX_ROOT, "src", "index.js"),
    "console.log('old')",
    "utf8"
  );

  // Seed SandboxManager directly — no workspace.js needed
  const sandboxManager = new SandboxManager();

  sandboxManager._store.set(PROJECT_ID, {
    id:           PROJECT_ID,
    path:         SANDBOX_ROOT,
    filesCreated: 1
  });

  const patchExecutor        = new PatchExecutor({ sandboxManager });
  const debugApprovalService = new MockDebugApprovalService();

  const svc = new RepairExecutionService({
    patchExecutor,
    approvalService: debugApprovalService
  });

  return { sandboxManager, patchExecutor, debugApprovalService, svc };

}


// ── Stages ────────────────────────────────────────────────────────────────────

async function stageOne(svc, debugApprovalService) {

  console.log("\n── Stage 1: Approved repair ─────────────────────────────────");

  // Submit and immediately approve
  const submitted = debugApprovalService.submitForApproval({
    projectId: PROJECT_ID,
    diagnosis: { rootCause: "stale log statement" },
    patchPlan: [
      {
        action:  "replace_file",
        path:    "src/index.js",
        content: "console.log('new')"
      }
    ]
  });

  debugApprovalService.approve({ debugId: submitted.debugId });

  const result = await svc.executeRepair({
    projectId: PROJECT_ID,
    debugId:   submitted.debugId,
    patchPlan: [
      {
        action:  "replace_file",
        path:    "src/index.js",
        content: "console.log('new')"
      }
    ]
  });

  const content = await fs.readFile(
    path.join(SANDBOX_ROOT, "src", "index.js"),
    "utf8"
  );

  assert("success === true",         result.success === true,            JSON.stringify(result));
  assert("status === PATCH_APPLIED", result.status  === "PATCH_APPLIED", result.status);
  assert("patchResult exists",       result.patchResult != null);
  assert("file content changed",     content === "console.log('new')",   content);

  return submitted.debugId;

}


async function stageTwo(svc, debugApprovalService) {

  console.log("\n── Stage 2: Not approved (PENDING_APPROVAL) ─────────────────");

  // Submit but do NOT approve
  const submitted = debugApprovalService.submitForApproval({
    projectId: PROJECT_ID,
    diagnosis: { rootCause: "second issue" },
    patchPlan: []
  });

  const result = await svc.executeRepair({
    projectId: PROJECT_ID,
    debugId:   submitted.debugId,
    patchPlan: []
  });

  assert("success === false",  result.success === false, JSON.stringify(result));
  assert("error exists",       typeof result.error === "string" && result.error.length > 0, result.error);

}


async function stageThree(svc) {

  console.log("\n── Stage 3: Invalid debugId ─────────────────────────────────");

  const result = await svc.executeRepair({
    projectId: PROJECT_ID,
    debugId:   "UNKNOWN",
    patchPlan: []
  });

  assert("success === false",  result.success === false, JSON.stringify(result));

}


async function stageFour(sandboxManager) {

  console.log("\n── Stage 4: Cleanup ─────────────────────────────────────────");

  sandboxManager.remove(PROJECT_ID);

  const workspace = sandboxManager.get(PROJECT_ID);

  assert("sandbox removed from manager",  workspace === null);

  // Best-effort filesystem teardown
  try {
    await fs.rm(SANDBOX_ROOT, { recursive: true, force: true });
  } catch { /* non-fatal */ }

}


// ── Runner ────────────────────────────────────────────────────────────────────

async function run() {

  console.log("════════════════════════════════════════════════════════════");
  console.log(" ANNEXE AI — REPAIR EXECUTION SERVICE TEST");
  console.log(" Phase 7.2");
  console.log("════════════════════════════════════════════════════════════");

  let sandboxManager, debugApprovalService, svc;

  try {
    ({ sandboxManager, debugApprovalService, svc } = await bootstrap());
  } catch (err) {
    console.error("BOOTSTRAP FAILED:", err.message);
    process.exit(1);
  }

  await stageOne(svc, debugApprovalService);
  await stageTwo(svc, debugApprovalService);
  await stageThree(svc);
  await stageFour(sandboxManager);

  console.log("\n════════════════════════════════════════════════════════════");

  if (failed === 0) {
    console.log(` ✅ ${passed} passed, 0 failed`);
    console.log("  REPAIR EXECUTION SERVICE TEST PASSED");
  } else {
    console.log(` ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("  REPAIR EXECUTION SERVICE TEST FAILED");
  }

  console.log("════════════════════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);

}

run();
