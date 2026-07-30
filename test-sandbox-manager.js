// ── ANNEXE AI — Sandbox Manager Test ─────────────────────────────────────────
//
// Place at project root and run:
//   node test-sandbox-manager.js
//
// Requires:
//   api/sandbox/manager.js
//   api/sandbox/workspace.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { SandboxManager } from "./api/sandbox/manager.js";
import fs from "fs/promises";
import path from "path";


// ── Assertion helper ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual) {
  if (condition) {
    console.log(`✅  ${label}`);
    passed++;
  } else {
    console.log(`❌  ${label}  →  got: ${JSON.stringify(actual)}`);
    failed++;
  }
  return condition;
}


// ── Test runner ───────────────────────────────────────────────────────────────

async function runTest() {

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  ANNEXE AI — Sandbox Manager Test");
  console.log("══════════════════════════════════════════════════════════\n");


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 1 — Create workspace
  // ════════════════════════════════════════════════════════════════════════════

  console.log("── Stage 1: Create workspace ─────────────────────────────\n");

  const manager   = new SandboxManager();
  const projectId = "MANAGER-TEST-001";

  const result = await manager.create({
    projectId,
    generatedFiles: [
      {
        path:    "index.js",
        content: "console.log('test')"
      }
    ]
  });

  assert("success === true",                       result.success === true,              result.success);
  assert("workspace object present",               !!result.workspace,                   null);
  assert("workspace id matches projectId",         result.workspace?.id === projectId,   result.workspace?.id);
  assert("workspace path is a string",             typeof result.workspace?.path === "string", result.workspace?.path);
  assert("workspace filesCreated === 1",           result.workspace?.filesCreated === 1, result.workspace?.filesCreated);

  const stored = manager.get(projectId);

  assert("manager.get returns workspace",          !!stored,                             null);
  assert("stored path matches created path",       stored?.path === result.workspace?.path, stored?.path);
  assert("stored id matches projectId",            stored?.id === projectId,             stored?.id);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 2 — Missing workspace lookup
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 2: Missing workspace lookup ─────────────────────\n");

  const missing = manager.get("UNKNOWN");

  assert("manager.get(\"UNKNOWN\") === null",      missing === null,                     missing);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 3 — Remove metadata
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 3: Remove metadata ──────────────────────────────\n");

  const removeResult = manager.remove(projectId);

  assert("remove returns success === true",        removeResult.success === true,        removeResult.success);
  assert("remove returns correct projectId",       removeResult.projectId === projectId, removeResult.projectId);
  assert("manager.get after remove === null",      manager.get(projectId) === null,      manager.get(projectId));


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 4 — Create failure handling
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 4: Create failure handling ─────────────────────\n");

  const failResult = await manager.create({
    projectId:      "",
    generatedFiles: []
  });

  assert("empty projectId returns success === false", failResult.success === false,      failResult.success);
  assert("failure result has error string",           typeof failResult.error === "string", typeof failResult.error);
  assert("failed workspace not stored",               manager.get("") === null,           manager.get(""));


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 5 — Cleanup
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 5: Cleanup ──────────────────────────────────────\n");

  const sandboxRoot = path.resolve("sandboxes");

  try {
    await fs.rm(sandboxRoot, { recursive: true, force: true });
    console.log("  Sandboxes directory removed:", sandboxRoot);
    assert("sandboxes directory cleaned up", true, null);
  } catch (err) {
    assert("sandboxes directory cleaned up", false, err.message);
  }


  // ════════════════════════════════════════════════════════════════════════════
  // Result
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  ✅  ${passed} passed, ${failed > 0 ? "❌  " : ""}${failed} failed`);

  if (failed === 0) {
    console.log("  SANDBOX MANAGER TEST PASSED");
  } else {
    console.log("  SANDBOX MANAGER TEST FAILED");
  }

  console.log("══════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  }

}

runTest().catch(err => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
