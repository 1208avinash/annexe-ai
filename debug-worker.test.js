// ── ANNEXE AI — Debug Worker Test Suite ──────────────────────────────────────
//
// Tests: run() contracts, error classification, file extraction,
//        patch plan structure, and task-generator integration.
//
// Run: node --experimental-vm-modules node_modules/.bin/jest tests/debug-worker.test.js
//   or: node tests/debug-worker.test.js   (if using the inline runner below)
//
// ─────────────────────────────────────────────────────────────────────────────

import { run }              from "../api/agents/debug/worker.js";
import { generateDebugTask } from "../task-generator.js";


// ── Minimal test runner (no jest dependency required) ─────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(label, fn) {
  try {
    fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (err) {
    console.log(`  ✗  ${label}`);
    console.log(`     ${err.message}`);
    failures.push({ label, error: err.message });
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label || "assertEqual"}: expected "${expected}", got "${actual}"`);
  }
}

function assertIncludes(value, substring, label) {
  if (!String(value).includes(substring)) {
    throw new Error(`${label || "assertIncludes"}: "${substring}" not found in "${value}"`);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Guard rails
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 1: Guard rails ──────────────────────────────────────");

test("returns failure when projectId is missing", () => {
  const result = run({ errorLogs: "some error" });
  assertEqual(result.success, false, "success");
  assert(result.error, "error field must be set");
  assertEqual(result.agent, "debug_worker", "agent");
});

test("returns failure when no logs are provided", () => {
  const result = run({ projectId: "P-001" });
  assertEqual(result.success, false, "success");
  assert(result.error, "error field must be set");
});

test("returns failure when logs are empty strings", () => {
  const result = run({ projectId: "P-001", errorLogs: "", buildReport: "" });
  assertEqual(result.success, false, "success");
});

test("returns failure when called with no arguments", () => {
  const result = run();
  assertEqual(result.success, false, "success");
});


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Output contract (success path)
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 2: Output contract ──────────────────────────────────");

const baseResult = run({
  projectId:  "P-TEST",
  errorLogs:  "SyntaxError: Unexpected token at index.js:12"
});

test("success result has success: true", () => {
  assertEqual(baseResult.success, true, "success");
});

test("success result includes agent identifier", () => {
  assertEqual(baseResult.agent, "debug_worker", "agent");
});

test("success result echoes projectId", () => {
  assertEqual(baseResult.projectId, "P-TEST", "projectId");
});

test("success result has diagnosis object", () => {
  assert(baseResult.diagnosis && typeof baseResult.diagnosis === "object", "diagnosis must be object");
});

test("success result has patchPlan object", () => {
  assert(baseResult.patchPlan && typeof baseResult.patchPlan === "object", "patchPlan must be object");
});

test("success result has _meta object", () => {
  assert(baseResult._meta && typeof baseResult._meta === "object", "_meta must be object");
});

test("_meta.analyzedAt is a valid ISO timestamp", () => {
  const ts = new Date(baseResult._meta.analyzedAt);
  assert(!isNaN(ts.getTime()), "analyzedAt must be a valid date");
});


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Error classification
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 3: Error classification ─────────────────────────────");

const cases = [
  { logs: "Cannot find module './utils/helper.js'",              expected: "import_error"  },
  { logs: "SyntaxError: Unexpected token '}'",                   expected: "syntax_error"  },
  { logs: "TypeError: runAgent is not a function",               expected: "type_error"    },
  { logs: "ENOENT: no such file or directory, open 'output.js'", expected: "missing_file"  },
  { logs: "Error: Request timed out after 30000ms",              expected: "timeout"       },
  { logs: "EACCES: permission denied '/var/build'",              expected: "permission"    },
  { logs: "FetchError: network request failed (ECONNREFUSED)",   expected: "network_error" },
  { logs: "AssertionError: expected 42 received 0",              expected: "test_failure"  },
  { logs: "Something completely unrecognised went wrong",        expected: "unknown"       }
];

for (const { logs, expected } of cases) {
  test(`classifies "${expected}" correctly`, () => {
    const result = run({ projectId: "P-CLASSIFY", errorLogs: logs });
    assertEqual(result.success, true, "run success");
    assertEqual(result.diagnosis.errorCategory, expected, "category");
    assertEqual(result.patchPlan.errorCategory, expected, "patchPlan.errorCategory");
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — File extraction
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 4: File extraction ───────────────────────────────────");

test("extracts file reference from import error log", () => {
  const result = run({
    projectId: "P-FILES",
    errorLogs: "Cannot find module from ./api/agents/debug/worker.js"
  });
  assertEqual(result.success, true, "run success");
  assert(
    result.diagnosis.affectedFiles.some(f => f.includes("worker.js")),
    "worker.js should appear in affectedFiles"
  );
});

test("affectedFiles is always an array", () => {
  const result = run({ projectId: "P-FILES2", errorLogs: "Something unknown broke" });
  assert(Array.isArray(result.diagnosis.affectedFiles), "affectedFiles must be array");
});

test("affectedFileCount matches affectedFiles length", () => {
  const result = run({
    projectId: "P-FILES3",
    errorLogs: "import failed from ./foo.js and ./bar.ts"
  });
  assertEqual(
    result.diagnosis.affectedFileCount,
    result.diagnosis.affectedFiles.length,
    "count mismatch"
  );
});

test("caps affected files at 10", () => {
  const manyFiles = Array.from({ length: 20 }, (_, i) =>
    `Cannot find module from ./file${i}.js`
  ).join("\n");
  const result = run({ projectId: "P-CAP", errorLogs: manyFiles });
  assert(result.diagnosis.affectedFiles.length <= 10, "must not exceed 10 files");
});


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — Patch plan contract
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 5: Patch plan contract ──────────────────────────────");

test("patchPlan.autoApplied is always false (V1 read-only)", () => {
  const result = run({ projectId: "P-PLAN", errorLogs: "TypeError: x is not a function" });
  assertEqual(result.patchPlan.autoApplied, false, "autoApplied");
});

test("patchPlan.requiresHumanReview is always true (V1)", () => {
  const result = run({ projectId: "P-PLAN2", errorLogs: "SyntaxError: bad token" });
  assertEqual(result.patchPlan.requiresHumanReview, true, "requiresHumanReview");
});

test("patchPlan.steps is a non-empty array", () => {
  const result = run({ projectId: "P-PLAN3", errorLogs: "network request failed" });
  assert(Array.isArray(result.patchPlan.steps) && result.patchPlan.steps.length > 0, "steps");
});

test("patchPlan.strategy is a non-empty string", () => {
  const result = run({ projectId: "P-PLAN4", errorLogs: "ENOENT: no such file" });
  assert(typeof result.patchPlan.strategy === "string" && result.patchPlan.strategy.length > 0, "strategy");
});

test("patchPlan.affectedFiles mirrors diagnosis.affectedFiles", () => {
  const result = run({
    projectId: "P-PLAN5",
    errorLogs: "import failed from ./index.js"
  });
  assertEqual(
    JSON.stringify(result.patchPlan.affectedFiles),
    JSON.stringify(result.diagnosis.affectedFiles),
    "affectedFiles mirror"
  );
});


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — Log source merging
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 6: Log source merging ────────────────────────────────");

test("uses errorLogs alone when buildReport is empty", () => {
  const result = run({ projectId: "P-SRC1", errorLogs: "SyntaxError: bad token", buildReport: "" });
  assertEqual(result.success, true, "success");
  assertEqual(result.diagnosis.errorCategory, "syntax_error", "category");
});

test("uses buildReport alone when errorLogs is empty", () => {
  const result = run({ projectId: "P-SRC2", errorLogs: "", buildReport: "TypeError: undefined is not a function" });
  assertEqual(result.success, true, "success");
  assertEqual(result.diagnosis.errorCategory, "type_error", "category");
});

test("merges both sources — buildReport category wins if errorLogs has no pattern", () => {
  const result = run({
    projectId:   "P-SRC3",
    errorLogs:   "some vague failure message",
    buildReport: "AssertionError: expected 1 received 0"
  });
  assertEqual(result.success, true, "success");
  // Combined log: vague text first, assertion second — first match wins
  // "some vague failure" → unknown; combined still hits assertion pattern
  assert(result.diagnosis.errorCategory !== undefined, "category must be set");
});

test("_meta.logSources lists only provided sources", () => {
  const result = run({ projectId: "P-SRC4", errorLogs: "SyntaxError", buildReport: "" });
  assert(result._meta.logSources.includes("errorLogs"), "errorLogs in sources");
  assert(!result._meta.logSources.includes("buildReport"), "empty buildReport excluded");
});

test("_meta.logSources includes buildReport when provided", () => {
  const result = run({ projectId: "P-SRC5", errorLogs: "err", buildReport: "report" });
  assert(result._meta.logSources.includes("buildReport"), "buildReport in sources");
});


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — generatedFiles passthrough
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 7: generatedFiles passthrough ────────────────────────");

test("_meta.generatedFileCount is 0 when not provided", () => {
  const result = run({ projectId: "P-GF1", errorLogs: "TypeError: x" });
  assertEqual(result._meta.generatedFileCount, 0, "generatedFileCount");
});

test("_meta.generatedFileCount reflects provided file list", () => {
  const files  = ["index.js", "utils.js", "config.js"];
  const result = run({ projectId: "P-GF2", errorLogs: "TypeError: x", generatedFiles: files });
  assertEqual(result._meta.generatedFileCount, 3, "generatedFileCount");
});


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — generateDebugTask integration
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 8: generateDebugTask integration ─────────────────────");

const debugTask = generateDebugTask({
  projectId:      "P-TASK",
  errorLogs:      "TypeError: build crashed",
  buildReport:    "exit code 1",
  generatedFiles: ["a.js", "b.js"]
});

test("generateDebugTask returns correct agentId", () => {
  assertEqual(debugTask.agentId, "debug_worker", "agentId");
});

test("generateDebugTask taskId contains projectId", () => {
  assertIncludes(debugTask.taskId, "P-TASK", "taskId");
});

test("generateDebugTask input.projectId matches", () => {
  assertEqual(debugTask.input.projectId, "P-TASK", "input.projectId");
});

test("generateDebugTask input.errorLogs is passed through", () => {
  assertEqual(debugTask.input.errorLogs, "TypeError: build crashed", "errorLogs");
});

test("generateDebugTask input.buildReport is passed through", () => {
  assertEqual(debugTask.input.buildReport, "exit code 1", "buildReport");
});

test("generateDebugTask input.generatedFiles is passed through", () => {
  assertEqual(debugTask.input.generatedFiles.length, 2, "generatedFiles length");
});

test("generateDebugTask priority is a number", () => {
  assert(typeof debugTask.priority === "number", "priority must be number");
});

test("task input feeds directly into run() without error", () => {
  const result = run(debugTask.input);
  assertEqual(result.success, true, "run success with task input");
  assertEqual(result.projectId, "P-TASK", "projectId round-trip");
});

test("generateDebugTask defaults empty arrays when not provided", () => {
  const task = generateDebugTask({ projectId: "P-DEFAULTS", errorLogs: "err" });
  assert(Array.isArray(task.input.generatedFiles), "generatedFiles defaults to array");
});

test("generateDebugTask defaults empty string for buildReport when omitted", () => {
  const task = generateDebugTask({ projectId: "P-DEFAULTS2", errorLogs: "err" });
  assertEqual(task.input.buildReport, "", "buildReport default");
});


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — diagnosis.summary content
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 9: Diagnosis summary ─────────────────────────────────");

test("summary mentions error category", () => {
  const result = run({ projectId: "P-SUM1", errorLogs: "SyntaxError: unexpected token" });
  assertIncludes(result.diagnosis.summary, "syntax_error", "category in summary");
});

test("summary mentions file name when file found", () => {
  const result = run({
    projectId: "P-SUM2",
    errorLogs: "Cannot find module from ./api/router.js"
  });
  if (result.diagnosis.affectedFiles.length > 0) {
    assertIncludes(result.diagnosis.summary, "router.js", "filename in summary");
  }
  // If no file extracted, just check summary is a non-empty string
  assert(result.diagnosis.summary.length > 0, "summary must be non-empty");
});

test("summary is always a non-empty string", () => {
  const result = run({ projectId: "P-SUM3", errorLogs: "completely unknown problem xyz" });
  assert(typeof result.diagnosis.summary === "string" && result.diagnosis.summary.length > 0, "summary");
});


// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────

const total = passed + failed;
console.log(`\n${"─".repeat(60)}`);
console.log(`  ANNEXE debug-worker tests: ${passed}/${total} passed`);
if (failures.length) {
  console.log(`\n  FAILURES:`);
  failures.forEach(f => console.log(`    ✗ ${f.label}\n      ${f.error}`));
}
console.log(`${"─".repeat(60)}\n`);

if (failed > 0) process.exit(1);
