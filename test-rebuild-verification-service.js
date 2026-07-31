/*
  ANNEXE AI — Rebuild Verification Service Integration Test
  FILE: test-rebuild-verification-service.js

  Tests the full verify-repair flow:
    1. SandboxManager.create()  ← must use production contract
    2. DebugApprovalService.submitForApproval() + .approve()
    3. RebuildVerificationService.verifyRepair()

  Stages:
    1. Approved repair      → mock BUILD_SUCCESS   → success
    2. Pending approval     → should fail pre-patch
    3. Invalid debugId      → should fail pre-patch
    4. Mock BUILD_FAILED    → patch ok, build fails
    5. Cleanup

  IMPORTANT:
    - Do NOT modify production files
    - SandboxManager.create() requires { projectId, generatedFiles: [{ path, content }] }
    - workspace is at result.workspace.path  (NOT result.path)
*/

import path from "path";

import { SandboxManager }            from "./api/sandbox/manager.js";
import { DebugApprovalService }      from "./api/orchestrator/debug-approval-service.js";
import { RebuildVerificationService } from "./api/orchestrator/rebuild-verification-service.js";
import { RepairExecutionService }    from "./api/orchestrator/repair-execution-service.js";
import { PatchExecutor }             from "./api/orchestrator/patch-executor.js";


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


// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_ID = "REBUILD-TEST-" + Date.now();

// Minimal generated files — matches createWorkspace() contract:
//   generatedFiles must be a non-empty array of { path, content }
const GENERATED_FILES = [
  { path: "src/index.js",   content: "// ANNEXE scaffold" },
  { path: "src/app.js",     content: "// app entry" }
];

// Minimal patch plan that PatchExecutor can apply
// (replace_file on a file that already exists in the sandbox)
const PATCH_PLAN = [
  {
    action:  "replace_file",
    path:    "src/index.js",
    content: "// patched by ANNEXE repair"
  }
];


// ── Setup ─────────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");
console.log("  REBUILD VERIFICATION SERVICE — INTEGRATION TEST");
console.log("════════════════════════════════════════");

const sandboxManager    = new SandboxManager();
const approvalService   = new DebugApprovalService();


// ── Stage 1 — Create sandbox (production contract) ────────────────────────────

section("Stage 1 — Create sandbox");

// Production API: SandboxManager.create({ projectId, generatedFiles })
// Returns:        { success, workspace: { id, path, filesCreated } }
const sandboxResult = await sandboxManager.create({
  projectId:      PROJECT_ID,
  generatedFiles: GENERATED_FILES
});

assert(
  "sandbox created successfully",
  sandboxResult.success === true,
  `got success=${sandboxResult.success}, error=${sandboxResult.error}`
);

assert(
  "workspace object present",
  sandboxResult.workspace && typeof sandboxResult.workspace === "object",
  `got workspace=${JSON.stringify(sandboxResult.workspace)}`
);

// workspace.path is the absolute directory — used by PatchExecutor
const workspacePath = sandboxResult.workspace?.path;

assert(
  "workspace.path is a string",
  typeof workspacePath === "string" && workspacePath.length > 0,
  `got path=${workspacePath}`
);

assert(
  "workspace.path includes projectId",
  workspacePath && workspacePath.includes(PROJECT_ID),
  `got path=${workspacePath}`
);

assert(
  "filesCreated matches input",
  sandboxResult.workspace?.filesCreated === GENERATED_FILES.length,
  `got filesCreated=${sandboxResult.workspace?.filesCreated}`
);

// Verify SandboxManager stored the workspace (get() must return it)
const storedWorkspace = sandboxManager.get(PROJECT_ID);

assert(
  "sandbox stored in manager",
  storedWorkspace !== null && storedWorkspace !== undefined,
  "sandboxManager.get() returned null — sandbox was not stored"
);


// ── Stage 2 — Submit and approve a debug record ───────────────────────────────

section("Stage 2 — Submit and approve debug record");

const submitResult = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: {
    status: "critical",
    errors: [{ errorId: "BUILD_FAILED", message: "Build failed" }]
  },
  patchPlan: PATCH_PLAN
});

assert(
  "submitForApproval succeeded",
  submitResult.success === true,
  `got success=${submitResult.success}, error=${submitResult.error}`
);

assert(
  "status is PENDING_APPROVAL",
  submitResult.status === "PENDING_APPROVAL",
  `got status=${submitResult.status}`
);

const { debugId } = submitResult;

const approveResult = approvalService.approve({ debugId });

assert(
  "approve succeeded",
  approveResult.success === true,
  `got success=${approveResult.success}, error=${approveResult.error}`
);

assert(
  "status is APPROVED",
  approveResult.status === "APPROVED",
  `got status=${approveResult.status}`
);


// ── Stage 3 — Approved repair → mock BUILD_SUCCESS ────────────────────────────

section("Stage 3 — Approved repair with mock BUILD_SUCCESS");

// Inject a mock execution worker that reports BUILD_SUCCESS
const mockBuildSuccess = {
  async run() {
    return {
      success:         true,
      status:          "BUILD_SUCCESS",
      executionReport: { logs: "Build passed", commands: [] }
    };
  }
};

// PatchExecutor needs the SandboxManager to find the workspace path
// We inject a real PatchExecutor backed by our sandboxManager
const patchExecutor = new PatchExecutor({ sandboxManager });
const repairService = new RepairExecutionService({
  patchExecutor,
  approvalService
});

const rebuildService = new RebuildVerificationService({
  repairExecutionService: repairService,
  executionWorker:        mockBuildSuccess
});

const verifySuccess = await rebuildService.verifyRepair({
  projectId:      PROJECT_ID,
  debugId,
  patchPlan:      PATCH_PLAN,
  generatedFiles: GENERATED_FILES
});

assert(
  "verifyRepair success === true",
  verifySuccess.success === true,
  `got success=${verifySuccess.success}, error=${verifySuccess.error}`
);

assert(
  "stage === BUILD",
  verifySuccess.stage === "BUILD",
  `got stage=${verifySuccess.stage}`
);

assert(
  "status === BUILD_SUCCESS",
  verifySuccess.status === "BUILD_SUCCESS",
  `got status=${verifySuccess.status}`
);

assert(
  "patchResult present",
  verifySuccess.patchResult && verifySuccess.patchResult.success === true,
  `got patchResult=${JSON.stringify(verifySuccess.patchResult)}`
);

assert(
  "executionResult present",
  verifySuccess.executionResult && verifySuccess.executionResult.success === true,
  `got executionResult=${JSON.stringify(verifySuccess.executionResult)}`
);


// ── Stage 4 — Pending approval → should fail pre-patch ───────────────────────

section("Stage 4 — Pending approval (not yet approved)");

const pendingSubmit = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: { status: "warning", errors: [] },
  patchPlan: PATCH_PLAN
});

// Do NOT approve — leave it in PENDING_APPROVAL

const verifyPending = await rebuildService.verifyRepair({
  projectId:  PROJECT_ID,
  debugId:    pendingSubmit.debugId,
  patchPlan:  PATCH_PLAN
});

assert(
  "verifyRepair fails for pending approval",
  verifyPending.success === false,
  `got success=${verifyPending.success}`
);

assert(
  "error mentions approval status",
  typeof verifyPending.error === "string" && verifyPending.error.length > 0,
  `got error=${verifyPending.error}`
);


// ── Stage 5 — Invalid debugId ─────────────────────────────────────────────────

section("Stage 5 — Invalid debugId");

const verifyInvalid = await rebuildService.verifyRepair({
  projectId: PROJECT_ID,
  debugId:   "DBG-DOES-NOT-EXIST",
  patchPlan: PATCH_PLAN
});

assert(
  "verifyRepair fails for invalid debugId",
  verifyInvalid.success === false,
  `got success=${verifyInvalid.success}`
);

assert(
  "error references missing record",
  typeof verifyInvalid.error === "string" && verifyInvalid.error.length > 0,
  `got error=${verifyInvalid.error}`
);


// ── Stage 6 — Approved repair → mock BUILD_FAILED ────────────────────────────

section("Stage 6 — Approved repair with mock BUILD_FAILED");

// Create a fresh debug record and approve it
const submitBuildFail = approvalService.submitForApproval({
  projectId: PROJECT_ID,
  diagnosis: { status: "critical", errors: [{ errorId: "COMPILE_ERROR", message: "Compile failed" }] },
  patchPlan: PATCH_PLAN
});

approvalService.approve({ debugId: submitBuildFail.debugId });

const mockBuildFail = {
  async run() {
    return {
      success:         false,
      status:          "BUILD_FAILED",
      error:           "Compile error after patch",
      executionReport: { logs: "Error: unexpected token", commands: [] }
    };
  }
};

const rebuildServiceFail = new RebuildVerificationService({
  repairExecutionService: repairService,
  executionWorker:        mockBuildFail
});

const verifyBuildFail = await rebuildServiceFail.verifyRepair({
  projectId:      PROJECT_ID,
  debugId:        submitBuildFail.debugId,
  patchPlan:      PATCH_PLAN,
  generatedFiles: GENERATED_FILES
});

assert(
  "verifyRepair success === false for BUILD_FAILED",
  verifyBuildFail.success === false,
  `got success=${verifyBuildFail.success}`
);

assert(
  "stage === BUILD",
  verifyBuildFail.stage === "BUILD",
  `got stage=${verifyBuildFail.stage}`
);

assert(
  "status === BUILD_FAILED",
  verifyBuildFail.status === "BUILD_FAILED",
  `got status=${verifyBuildFail.status}`
);

assert(
  "patchResult was successful (patch applied before build)",
  verifyBuildFail.patchResult && verifyBuildFail.patchResult.success === true,
  `got patchResult=${JSON.stringify(verifyBuildFail.patchResult)}`
);


// ── Stage 7 — Cleanup ─────────────────────────────────────────────────────────

section("Stage 7 — Cleanup");

const removeResult = sandboxManager.remove(PROJECT_ID);

assert(
  "remove succeeded",
  removeResult.success === true,
  `got success=${removeResult.success}`
);

assert(
  "sandbox no longer in manager",
  sandboxManager.get(PROJECT_ID) === null,
  "sandboxManager.get() should return null after remove"
);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");

if (failed === 0) {
  console.log(`✅ ${passed} passed, 0 failed`);
  console.log("REBUILD VERIFICATION SERVICE TEST PASSED");
} else {
  console.log(`❌ ${passed} passed, ${failed} failed`);
  console.log("REBUILD VERIFICATION SERVICE TEST FAILED");
}

console.log("════════════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
