// ── ANNEXE AI — Sandbox Workspace Test Suite ─────────────────────────────────
//
// Verifies workspace creation, file writing, validation failures,
// and path traversal protection in api/sandbox/workspace.js.
//
// Run:
//   node test-sandbox-workspace.js
//
// ─────────────────────────────────────────────────────────────────────────────

import fs   from "fs/promises";
import path from "path";

import { createWorkspace } from "./api/sandbox/workspace.js";


// ── Assertion helper ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}


// ── Filesystem helper ─────────────────────────────────────────────────────────

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}


// ════════════════════════════════════════════════════════════════════════════
// Stage 1 — Happy Path
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 1 — Happy Path");
console.log("════════════════════════════════════════════════════════════════");

const s1Result = await createWorkspace({
  projectId: "TEST-SANDBOX-001",
  generatedFiles: [
    { path: "src/index.js",      content: "console.log('hello')" },
    { path: "src/api/routes.js", content: "// routes"            },
    { path: "package.json",      content: "{}"                   }
  ]
});

assert(
  "success === true",
  s1Result.success === true
);

assert(
  "workspace object exists",
  s1Result.workspace !== null && s1Result.workspace !== undefined
);

assert(
  "filesCreated === 3",
  s1Result.workspace?.filesCreated === 3
);

assert(
  "workspace.path is a string",
  typeof s1Result.workspace?.path === "string"
);

assert(
  "workspace.id === projectId",
  s1Result.workspace?.id === "TEST-SANDBOX-001"
);

// Verify directory actually exists on disk
const workspaceDirExists = await pathExists(s1Result.workspace?.path);

assert(
  "workspace directory exists on disk",
  workspaceDirExists === true
);

// Verify a nested file was written correctly
const nestedFilePath = path.join(s1Result.workspace?.path, "src/api/routes.js");
const nestedFileExists = await pathExists(nestedFilePath);

assert(
  "nested file src/api/routes.js exists on disk",
  nestedFileExists === true
);

// Verify file content was written unchanged
const writtenContent = await fs.readFile(
  path.join(s1Result.workspace?.path, "src/index.js"),
  "utf8"
);

assert(
  "file content written correctly",
  writtenContent === "console.log('hello')"
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 2 — Missing projectId
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 2 — Missing projectId");
console.log("════════════════════════════════════════════════════════════════");

const s2Result = await createWorkspace({
  generatedFiles: []
});

assert(
  "success === false",
  s2Result.success === false
);

assert(
  "error message exists",
  typeof s2Result.error === "string" && s2Result.error.length > 0
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 3 — Missing generatedFiles
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 3 — Missing generatedFiles");
console.log("════════════════════════════════════════════════════════════════");

const s3Result = await createWorkspace({
  projectId: "TEST"
});

assert(
  "success === false",
  s3Result.success === false
);

assert(
  "error message exists",
  typeof s3Result.error === "string" && s3Result.error.length > 0
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 4 — Invalid file path (path traversal)
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 4 — Invalid file path (path traversal)");
console.log("════════════════════════════════════════════════════════════════");

const s4Result = await createWorkspace({
  projectId: "TEST-SANDBOX-TRAVERSAL",
  generatedFiles: [
    { path: "../../outside.txt", content: "bad" }
  ]
});

assert(
  "workspace creation fails safely",
  s4Result.success === false
);

assert(
  "error message exists",
  typeof s4Result.error === "string" && s4Result.error.length > 0
);

// Confirm the outside.txt was NOT written anywhere it shouldn't be
const outsidePath = path.resolve("outside.txt");
const outsideExists = await pathExists(outsidePath);

assert(
  "no file written outside workspace root",
  outsideExists === false
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 5 — Cleanup
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 5 — Cleanup");
console.log("════════════════════════════════════════════════════════════════");

const sandboxRoot  = path.resolve("sandboxes");
let cleanupSuccess = false;

try {
  await fs.rm(sandboxRoot, { recursive: true, force: true });
  cleanupSuccess = true;
} catch (err) {
  console.error("  Cleanup error:", err.message);
}

assert(
  "sandboxes/ directory removed",
  cleanupSuccess === true
);

const sandboxStillExists = await pathExists(sandboxRoot);

assert(
  "sandboxes/ no longer exists on disk",
  sandboxStillExists === false
);


// ════════════════════════════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════════════════════════════

const total = passed + failed;

console.log("\n════════════════════════════════════════════════════════════════");

if (failed === 0) {
  console.log(`  ✅  ${passed} passed, 0 failed`);
  console.log("  SANDBOX WORKSPACE TEST PASSED");
} else {
  console.log(`  ✅  ${passed} passed   ❌  ${failed} failed   (${total} total)`);
  console.log("  SANDBOX WORKSPACE TEST FAILED");
}

console.log("════════════════════════════════════════════════════════════════\n");
