// ── ANNEXE AI — Patch Executor Test ──────────────────────────────────────────
//
// Phase 7.1
//
// Proves: Approved Patch Plan → Patch Executor → Sandbox Files Modified
//
// Stages:
//   1. replace_file       — overwrite existing file
//   2. create_file        — create new file
//   3. append_file        — append to existing file
//   4. prepend_file       — prepend to existing file
//   5. delete_file        — remove existing file
//   6. path traversal     — rejected, outside file never created
//   7. cleanup            — sandbox removed from manager
//
// Self-contained: seeds SandboxManager._store directly so workspace.js
// is not required as a runtime dependency.
//
// Run:
//   node test-patch-executor.js
//
// ─────────────────────────────────────────────────────────────────────────────

import path   from "path";
import fs     from "fs/promises";
import os     from "os";

import { SandboxManager } from "./api/sandbox/manager.js";
import { PatchExecutor }  from "./api/orchestrator/patch-executor.js";


// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_ID   = "PATCH-EXECUTOR-TEST-001";
const SANDBOX_ROOT = path.join(os.tmpdir(), "annexe-sandbox-" + Date.now());


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


// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap() {

  // Create sandbox directory and seed initial files on the real filesystem
  await fs.mkdir(path.join(SANDBOX_ROOT, "src"), { recursive: true });

  await fs.writeFile(
    path.join(SANDBOX_ROOT, "src", "index.js"),
    "console.log('original')",
    "utf8"
  );

  await fs.writeFile(
    path.join(SANDBOX_ROOT, "src", "utils.js"),
    "export const value = 1",
    "utf8"
  );

  // Seed SandboxManager directly — no workspace.js dependency needed
  const mgr = new SandboxManager();

  mgr._store.set(PROJECT_ID, {
    id:           PROJECT_ID,
    path:         SANDBOX_ROOT,
    filesCreated: 2
  });

  const executor = new PatchExecutor({ sandboxManager: mgr });

  return { mgr, executor };

}


// ── Stages ────────────────────────────────────────────────────────────────────

async function stageOne(executor) {

  console.log("\n── Stage 1: replace_file ────────────────────────────────────");

  const result = await executor.applyPatch({
    projectId: PROJECT_ID,
    patchPlan: [
      {
        action:  "replace_file",
        path:    "src/index.js",
        content: "console.log('patched')"
      }
    ]
  });

  const content = await fs.readFile(
    path.join(SANDBOX_ROOT, "src", "index.js"),
    "utf8"
  );

  assert("success === true",              result.success === true);
  assert("applied === 1",                 result.applied === 1);
  assert("file content changed",          content === "console.log('patched')");

}


async function stageTwo(executor) {

  console.log("\n── Stage 2: create_file ─────────────────────────────────────");

  await executor.applyPatch({
    projectId: PROJECT_ID,
    patchPlan: [
      {
        action:  "create_file",
        path:    "src/new.js",
        content: "export default true"
      }
    ]
  });

  let exists = false;
  try {
    await fs.access(path.join(SANDBOX_ROOT, "src", "new.js"));
    exists = true;
  } catch { /* file not found */ }

  assert("file exists",  exists);

}


async function stageThree(executor) {

  console.log("\n── Stage 3: append_file ─────────────────────────────────────");

  await executor.applyPatch({
    projectId: PROJECT_ID,
    patchPlan: [
      {
        action:  "append_file",
        path:    "src/utils.js",
        content: "\nexport const added = 2"
      }
    ]
  });

  const content = await fs.readFile(
    path.join(SANDBOX_ROOT, "src", "utils.js"),
    "utf8"
  );

  assert(
    "content appended",
    content === "export const value = 1\nexport const added = 2"
  );

}


async function stageFour(executor) {

  console.log("\n── Stage 4: prepend_file ────────────────────────────────────");

  await executor.applyPatch({
    projectId: PROJECT_ID,
    patchPlan: [
      {
        action:  "prepend_file",
        path:    "src/utils.js",
        content: "// header\n"
      }
    ]
  });

  const content = await fs.readFile(
    path.join(SANDBOX_ROOT, "src", "utils.js"),
    "utf8"
  );

  assert(
    "content prepended",
    content.startsWith("// header\n")
  );

}


async function stageFive(executor) {

  console.log("\n── Stage 5: delete_file ─────────────────────────────────────");

  await executor.applyPatch({
    projectId: PROJECT_ID,
    patchPlan: [
      {
        action: "delete_file",
        path:   "src/new.js"
      }
    ]
  });

  let exists = false;
  try {
    await fs.access(path.join(SANDBOX_ROOT, "src", "new.js"));
    exists = true;
  } catch { /* expected — file was deleted */ }

  assert("file removed",  !exists);

}


async function stageSix(executor) {

  console.log("\n── Stage 6: path traversal protection ──────────────────────");

  const outsidePath = path.resolve(SANDBOX_ROOT, "../../outside.js");

  const result = await executor.applyPatch({
    projectId: PROJECT_ID,
    patchPlan: [
      {
        action:  "replace_file",
        path:    "../../outside.js",
        content: "bad"
      }
    ]
  });

  let outsideExists = false;
  try {
    await fs.access(outsidePath);
    outsideExists = true;
  } catch { /* good — file must not exist */ }

  assert(
    "error captured in result",
    Array.isArray(result.errors) && result.errors.length > 0
  );

  assert(
    "outside file not created",
    !outsideExists
  );

}


async function stageSeven(mgr) {

  console.log("\n── Stage 7: cleanup ─────────────────────────────────────────");

  mgr.remove(PROJECT_ID);

  const workspace = mgr.get(PROJECT_ID);

  assert("sandbox removed from manager",  workspace === null);

  // Best-effort filesystem teardown
  try {
    await fs.rm(SANDBOX_ROOT, { recursive: true, force: true });
  } catch { /* non-fatal */ }

}


// ── Runner ────────────────────────────────────────────────────────────────────

async function run() {

  console.log("════════════════════════════════════════════════════════════");
  console.log(" ANNEXE AI — PATCH EXECUTOR TEST");
  console.log(" Phase 7.1");
  console.log("════════════════════════════════════════════════════════════");

  let mgr, executor;

  try {
    ({ mgr, executor } = await bootstrap());
  } catch (err) {
    console.error("BOOTSTRAP FAILED:", err.message);
    process.exit(1);
  }

  await stageOne(executor);
  await stageTwo(executor);
  await stageThree(executor);
  await stageFour(executor);
  await stageFive(executor);
  await stageSix(executor);
  await stageSeven(mgr);

  console.log("\n════════════════════════════════════════════════════════════");

  if (failed === 0) {
    console.log(` ✅ ${passed} passed, 0 failed`);
    console.log("  PATCH EXECUTOR TEST PASSED");
  } else {
    console.log(` ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("  PATCH EXECUTOR TEST FAILED");
  }

  console.log("════════════════════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);

}

run();
