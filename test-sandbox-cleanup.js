// ── ANNEXE AI — Sandbox Cleanup Test ─────────────────────────────────────────
//
// Place at project root and run:
//   node test-sandbox-cleanup.js
//
// Requires:
//   api/sandbox/workspace.js
//   api/sandbox/cleanup.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { createWorkspace }  from "./lib/sandbox/workspace.js";
import { cleanupWorkspace } from "./lib/sandbox/cleanup.js";
import fs                   from "fs/promises";
import path                 from "path";


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


// ── Filesystem helper ─────────────────────────────────────────────────────────

async function directoryExists(dirPath) {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}


// ── Test runner ───────────────────────────────────────────────────────────────

async function runTest() {

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  ANNEXE AI — Sandbox Cleanup Test");
  console.log("══════════════════════════════════════════════════════════\n");


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 1 — Happy path cleanup
  // ════════════════════════════════════════════════════════════════════════════

  console.log("── Stage 1: Happy path cleanup ───────────────────────────\n");

  const projectId1 = "CLEANUP-TEST-001";

  await createWorkspace({
    projectId:      projectId1,
    generatedFiles: [
      { path: "index.js", content: "console.log('cleanup')" }
    ]
  });

  const workspacePath1 = path.resolve("sandboxes", projectId1);
  const existsBefore   = await directoryExists(workspacePath1);

  assert("workspace exists before cleanup", existsBefore, existsBefore);

  const result1 = await cleanupWorkspace({ projectId: projectId1 });

  assert("success === true",        result1.success === true,  result1.success);
  assert("removed === true",        result1.removed === true,  result1.removed);

  const existsAfter = await directoryExists(workspacePath1);

  assert("folder no longer exists", existsAfter === false,     existsAfter);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 2 — Missing sandbox
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 2: Missing sandbox ──────────────────────────────\n");

  let threw   = false;
  let result2;

  try {
    result2 = await cleanupWorkspace({ projectId: "DOES-NOT-EXIST" });
  } catch {
    threw = true;
  }

  assert("does not throw",   threw === false,           threw);
  assert("success === true", result2?.success === true, result2?.success);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 3 — Traversal protection
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 3: Traversal protection ─────────────────────────\n");

  const result3 = await cleanupWorkspace({ projectId: "../outside" });

  assert("success === false", result3.success === false,                           result3.success);
  assert("error exists",      typeof result3.error === "string" &&
                              result3.error.length > 0,                            result3.error);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 4 — Root protection
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 4: Root protection ──────────────────────────────\n");

  const result4 = await cleanupWorkspace({ projectId: "." });

  assert("success === false", result4.success === false,                           result4.success);
  assert("error exists",      typeof result4.error === "string" &&
                              result4.error.length > 0,                            result4.error);


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
  console.log(`  ✅  ${passed} passed, ${failed > 0 ? `❌  ${failed} failed` : "0 failed"}`);

  if (failed === 0) {
    console.log("  SANDBOX CLEANUP TEST PASSED");
  } else {
    console.log("  SANDBOX CLEANUP TEST FAILED");
  }

  console.log("══════════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);

}

runTest().catch(err => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
