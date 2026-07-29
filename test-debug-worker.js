// ── ANNEXE AI — Debug Worker Test ────────────────────────────────────────────
//
// Run from D:\annex-web:
//   node test-debug-worker.js
//
// Tests all three debug modules:
//   api/agents/debug/analyzer.js
//   api/agents/debug/patcher.js
//   api/agents/debug/worker.js
//
// Also tests orchestrator integration:
//   api/orchestrator/task-generator.js  (generateDebugTask)
//   api/orchestrator/agent-adapters.js  (debugWorkerAdapter)
//   api/orchestrator/agent-mapper.js    (getAgentRoute)
//   api/orchestrator/agents.js          (getAgent)
//
// ─────────────────────────────────────────────────────────────────────────────

import { analyze }                          from "./api/agents/debug/analyzer.js";
import { buildPatchPlan }                   from "./api/agents/debug/patcher.js";
import { run }                              from "./api/agents/debug/worker.js";
import { generateDebugTask }                from "./api/orchestrator/task-generator.js";
import { debugWorkerAdapter, getAdapter }   from "./api/orchestrator/agent-adapters.js";
import { getAgentRoute }                    from "./api/orchestrator/agent-mapper.js";
import { getAgent }                         from "./api/orchestrator/agents.js";


// ── Assert helper ─────────────────────────────────────────────────────────────

function assert(label, condition, actual) {
  console.log(
    `${condition ? "✅" : "❌"}  ${label}` +
    `${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`
  );
  return condition;
}


// ── Shared fixtures ───────────────────────────────────────────────────────────

const IMPORT_LOG = `
Error: Cannot find module './utils/helpers.js'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:1039:15)
    at require (./api/agents/debug/worker.js:12)
`;

const SYNTAX_LOG = `
SyntaxError: Unexpected token '}'
    at wrapSafe (node:internal/modules/cjs/loader:1281:20)
    in ./api/agents/build/worker.js line 47
`;

const BUILD_FAIL_LOG = `
TypeError: runBuildWorker is not a function
Build failed: exit code 1
`;

const TEST_FAIL_LOG = `
FAIL src/tests/pipeline.test.js
  ● 3 tests failed
  AssertionError: expected 200 received 500
    at Object.<anonymous> (src/tests/pipeline.test.js:42)
`;

const MULTI_ERROR_LOG = `
Cannot find module 'missing-dep'
SyntaxError: Unexpected token '}'
TypeError: value is not defined
Build failed: exit code 1
`;

const GENERATED_FILES = [
  "api/agents/debug/worker.js",
  "api/agents/build/worker.js",
  "api/orchestrator/agents.js"
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — analyzer.js
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Debug Worker Test");
console.log("══════════════════════════════════════════════════════════");

console.log("\n── Section 1: analyzer.js ───────────────────────────────\n");

// 1a. Basic output shape
const diag1 = analyze({ errorLogs: IMPORT_LOG, buildReport: "", generatedFiles: [] });

assert("analyze returns object",              typeof diag1 === "object",                   diag1);
assert("analyze.status is string",            typeof diag1.status === "string",            diag1.status);
assert("analyze.summary is string",           typeof diag1.summary === "string",           diag1.summary);
assert("analyze.errors is array",             Array.isArray(diag1.errors),                 null);
assert("analyze.affectedFiles is array",      Array.isArray(diag1.affectedFiles),          null);
assert("analyze.errorCount exists",           typeof diag1.errorCount === "object",        null);
assert("analyze.analyzedAt is set",           !!diag1.analyzedAt,                          null);

// 1b. Dependency error classification
assert("DEP_NOT_FOUND detected",
  diag1.errors.some(e => e.errorId === "DEP_NOT_FOUND"),
  diag1.errors.map(e => e.errorId));

assert("dep error is critical",
  diag1.errors.find(e => e.errorId === "DEP_NOT_FOUND")?.severity === "critical",
  null);

assert("dep error source is dependency",
  diag1.errors.find(e => e.errorId === "DEP_NOT_FOUND")?.source === "dependency",
  null);

// 1c. Syntax error classification
const diag2 = analyze({ errorLogs: SYNTAX_LOG });
assert("SYNTAX_ERROR detected",
  diag2.errors.some(e => e.errorId === "SYNTAX_ERROR"),
  diag2.errors.map(e => e.errorId));

assert("syntax error status is critical",     diag2.status === "critical",                 diag2.status);

// 1d. Multi-error log
const diagMulti = analyze({ errorLogs: MULTI_ERROR_LOG });
assert("multi-error: errorCount.total > 1",   diagMulti.errorCount.total > 1,              diagMulti.errorCount.total);
assert("multi-error: errorCount.critical > 0",diagMulti.errorCount.critical > 0,           diagMulti.errorCount.critical);

// 1e. Clean log
const diagClean = analyze({ errorLogs: "Build completed successfully." });
assert("clean log: status = clean",           diagClean.status === "clean",                diagClean.status);
assert("clean log: errors empty",             diagClean.errors.length === 0,              diagClean.errors.length);

// 1f. File extraction with known files
const diagFiles = analyze({ errorLogs: IMPORT_LOG, generatedFiles: GENERATED_FILES });
assert("affectedFiles is array",              Array.isArray(diagFiles.affectedFiles),      null);

// 1g. Test failure detection
const diagTest = analyze({ errorLogs: TEST_FAIL_LOG });
assert("TEST_FAILED detected",
  diagTest.errors.some(e => e.errorId === "TEST_FAILED"),
  diagTest.errors.map(e => e.errorId));

// 1h. Empty input
const diagEmpty = analyze({});
assert("empty input returns clean",           diagEmpty.status === "clean",                diagEmpty.status);
assert("empty input errors = []",             diagEmpty.errors.length === 0,              diagEmpty.errors.length);


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — patcher.js
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 2: patcher.js ────────────────────────────────\n");

// 2a. Clean diagnosis → empty patch plan
const cleanDiag = analyze({ errorLogs: "All good." });
const cleanPlan = buildPatchPlan(cleanDiag);
assert("clean diagnosis → empty patchPlan",   Array.isArray(cleanPlan) && cleanPlan.length === 0, cleanPlan.length);

// 2b. Import error → patch proposal
const importDiag = analyze({ errorLogs: IMPORT_LOG });
const importPlan = buildPatchPlan(importDiag);
assert("import error → patch exists",         importPlan.length > 0,                       importPlan.length);
assert("patch has patchId",                   !!importPlan[0].patchId,                     null);
assert("patch has priority",                  !!importPlan[0].priority,                    null);
assert("patch has targetError",               !!importPlan[0].targetError,                 null);
assert("patch has action",                    !!importPlan[0].action,                      null);
assert("patch has description",               !!importPlan[0].description,                 null);
assert("patch has suggestion",                !!importPlan[0].suggestion,                  null);
assert("patch.automated is boolean",          typeof importPlan[0].automated === "boolean",null);

// 2c. DEP_NOT_FOUND → install-dependency action
const depPatch = importPlan.find(p => p.targetError === "DEP_NOT_FOUND");
assert("DEP_NOT_FOUND → install-dependency",
  depPatch?.action === "install-dependency",
  depPatch?.action);

assert("DEP_NOT_FOUND automated = true",
  depPatch?.automated === true,
  depPatch?.automated);

// 2d. Multi-error → multiple proposals, sorted by priority
const multiDiag = analyze({ errorLogs: MULTI_ERROR_LOG });
const multiPlan = buildPatchPlan(multiDiag);
assert("multi-error → multiple patches",      multiPlan.length > 1,                        multiPlan.length);

// Verify high-priority patches come before low-priority
const priorities = multiPlan.map(p => p.priority);
const hasHighFirst = priorities[0] === "high" || !priorities.includes("high");
assert("patches sorted: high priority first", hasHighFirst,                                 priorities);

// 2e. Deduplication — same errorId appears once only
const errorIds = multiPlan.map(p => p.targetError);
const unique   = new Set(errorIds);
assert("no duplicate errorIds in patchPlan",  errorIds.length === unique.size,              errorIds);

// 2f. Null/undefined diagnosis guard
const nullPlan = buildPatchPlan(null);
assert("null diagnosis → empty array",        Array.isArray(nullPlan) && nullPlan.length === 0, nullPlan);


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — worker.js run()
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 3: worker.js run() ───────────────────────────\n");

// 3a. Guard: missing projectId
const g1 = run({});
assert("missing projectId → success: false",  g1.success === false,                        g1.success);
assert("missing projectId → error set",       !!g1.error,                                  g1.error);
assert("missing projectId → agent set",       g1.agent === "debug_worker",                 g1.agent);

// 3b. Guard: no logs
const g2 = run({ projectId: "P-001", errorLogs: "", buildReport: "" });
assert("no logs → success: false",            g2.success === false,                        g2.success);
assert("no logs → error set",                 !!g2.error,                                  g2.error);

// 3c. Happy path — full output shape
const r1 = run({ projectId: "P-BUILD-001", errorLogs: IMPORT_LOG });
assert("run success: true",                   r1.success === true,                         r1.success);
assert("run agent = debug_worker",            r1.agent   === "debug_worker",               r1.agent);
assert("run version set",                     !!r1.version,                                r1.version);
assert("run projectId echoed",               r1.projectId === "P-BUILD-001",              r1.projectId);
assert("run diagnosis is object",             typeof r1.diagnosis === "object",            null);
assert("run patchPlan is array",              Array.isArray(r1.patchPlan),                 null);
assert("run _meta is object",                 typeof r1._meta === "object",               null);
assert("run _meta.analyzedAt set",            !!r1._meta.analyzedAt,                      null);
assert("run _meta.patchCount matches plan",   r1._meta.patchCount === r1.patchPlan.length,r1._meta.patchCount);

// 3d. worker delegates to analyzer — diagnosis has expected shape
assert("diagnosis.status set",                !!r1.diagnosis.status,                       r1.diagnosis.status);
assert("diagnosis.errors is array",           Array.isArray(r1.diagnosis.errors),          null);
assert("diagnosis.errorCount.total >= 0",     r1.diagnosis.errorCount.total >= 0,         null);

// 3e. worker delegates to patcher — patches reference diagnosis errors
if (r1.patchPlan.length > 0) {
  const diagErrorIds  = new Set(r1.diagnosis.errors.map(e => e.errorId));
  const patchTargets  = r1.patchPlan.map(p => p.targetError);
  const allKnown      = patchTargets.every(t => diagErrorIds.has(t));
  assert("all patchPlan.targetError found in diagnosis.errors", allKnown, patchTargets);
}

// 3f. logSources tracking
const r2 = run({ projectId: "P-002", errorLogs: "err", buildReport: "report" });
assert("both sources tracked in _meta",
  r2._meta.logSources.includes("errorLogs") && r2._meta.logSources.includes("buildReport"),
  r2._meta.logSources);

const r3 = run({ projectId: "P-003", errorLogs: "err", buildReport: "" });
assert("empty buildReport excluded from logSources",
  !r3._meta.logSources.includes("buildReport"),
  r3._meta.logSources);

// 3g. generatedFiles passthrough
const r4 = run({ projectId: "P-004", errorLogs: BUILD_FAIL_LOG, generatedFiles: ["a.js", "b.js"] });
assert("generatedFileCount reflects input",   r4._meta.generatedFileCount === 2,           r4._meta.generatedFileCount);

// 3h. Test failure log
const r5 = run({ projectId: "P-005", errorLogs: TEST_FAIL_LOG });
assert("test failure → success: true",        r5.success === true,                         r5.success);
assert("test failure → patch plan non-empty", r5.patchPlan.length > 0,                    r5.patchPlan.length);


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — orchestrator: task-generator.js
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 4: orchestrator/task-generator.js ────────────\n");

const task = generateDebugTask({
  projectId:      "P-TASK-001",
  errorLogs:      "TypeError: x is not a function",
  buildReport:    "exit code 1",
  generatedFiles: ["index.js", "worker.js"]
});

assert("task.agentId = debug_worker",         task.agentId === "debug_worker",             task.agentId);
assert("task.taskId contains projectId",      task.taskId.includes("P-TASK-001"),          task.taskId);
assert("task.priority is number",             typeof task.priority === "number",           task.priority);
assert("task.input.projectId set",            task.input.projectId === "P-TASK-001",      task.input.projectId);
assert("task.input.errorLogs set",            task.input.errorLogs === "TypeError: x is not a function", null);
assert("task.input.buildReport set",          task.input.buildReport === "exit code 1",   null);
assert("task.input.generatedFiles length 2",  task.input.generatedFiles.length === 2,     null);

// Confirm task input feeds directly into run()
const taskRunResult = run(task.input);
assert("task.input → run() succeeds",         taskRunResult.success === true,              taskRunResult.success);
assert("task.input → projectId echoed",       taskRunResult.projectId === "P-TASK-001",   taskRunResult.projectId);

// Default handling
const taskDefaults = generateDebugTask({ projectId: "P-DEF", errorLogs: "err" });
assert("missing generatedFiles defaults []",  Array.isArray(taskDefaults.input.generatedFiles), null);
assert("missing buildReport defaults ''",     taskDefaults.input.buildReport === "",       taskDefaults.input.buildReport);


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — orchestrator: agent-adapters.js
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 5: orchestrator/agent-adapters.js ────────────\n");

// 5a. getAdapter lookup
const adapter = getAdapter("debug_worker");
assert("getAdapter('debug_worker') found",    !!adapter,                                   null);
assert("adapter has prepareInput",            typeof adapter.prepareInput === "function",  null);
assert("adapter has processOutput",           typeof adapter.processOutput === "function", null);

// 5b. prepareInput shapes state → worker input
const state = {
  projectId:      "P-ADAPT-001",
  errorLogs:      "Build failed: exit code 1",
  buildReport:    "no output",
  generatedFiles: ["api/worker.js"],
  phase:          "build_failed"
};

const adapterInput = debugWorkerAdapter.prepareInput(state);
assert("prepareInput.projectId",              adapterInput.projectId === "P-ADAPT-001",   adapterInput.projectId);
assert("prepareInput.errorLogs",              adapterInput.errorLogs === state.errorLogs, null);
assert("prepareInput.buildReport",            adapterInput.buildReport === state.buildReport, null);
assert("prepareInput.generatedFiles",         adapterInput.generatedFiles.length === 1,   null);

// Confirm adapter input feeds into worker
const adapterRunResult = run(adapterInput);
assert("adapter input → run() succeeds",      adapterRunResult.success === true,           adapterRunResult.success);

// 5c. processOutput on success
const successResult = run(adapterInput);
const nextState     = debugWorkerAdapter.processOutput(state, successResult);
assert("processOutput success → phase: debug_complete",
  nextState.phase === "debug_complete",
  nextState.phase);
assert("processOutput success → diagnosis in state", !!nextState.diagnosis,               null);
assert("processOutput success → patchPlan in state", Array.isArray(nextState.patchPlan),  null);

// 5d. processOutput on failure
const failState = debugWorkerAdapter.processOutput(state, {
  success: false,
  error:   "analyzer crashed"
});
assert("processOutput failure → phase: debug_failed",
  failState.phase === "debug_failed",
  failState.phase);
assert("processOutput failure → debugError set", !!failState.debugError,                  failState.debugError);

// 5e. Missing state fields → graceful defaults
const sparseInput = debugWorkerAdapter.prepareInput({ projectId: "P-SPARSE" });
assert("prepareInput: missing errorLogs → ''",
  sparseInput.errorLogs === "",
  sparseInput.errorLogs);
assert("prepareInput: missing generatedFiles → []",
  Array.isArray(sparseInput.generatedFiles) && sparseInput.generatedFiles.length === 0,
  sparseInput.generatedFiles);


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — orchestrator: agent-mapper.js + agents.js
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Section 6: orchestrator/agent-mapper.js + agents.js ──\n");

// 6a. Route registered
const route = getAgentRoute("debug_worker");
assert("debug_worker route registered",       !!route,                                     null);
assert("route is /api/agents/debug/worker",   route === "/api/agents/debug/worker",        route);

// 6b. Unknown agent returns null
assert("unknown agent route → null",          getAgentRoute("nonexistent") === null,       null);

// 6c. Agent registry
const agentEntry = getAgent("debug_worker");
assert("getAgent('debug_worker') found",      !!agentEntry,                               null);
assert("agent.id = debug_worker",             agentEntry.id === "debug_worker",           agentEntry.id);
assert("agent.run is function",               typeof agentEntry.run === "function",        null);
assert("agent.version = 1",                   agentEntry.version === 1,                   agentEntry.version);

// 6d. agent.run is the same as imported run()
const directResult  = run({ projectId: "P-REG", errorLogs: SYNTAX_LOG });
const registryResult = agentEntry.run({ projectId: "P-REG", errorLogs: SYNTAX_LOG });
assert("agent.run output matches direct run()",
  directResult.success === registryResult.success &&
  directResult.agent   === registryResult.agent,
  null);

// 6e. Other agents still registered (no regression)
assert("delivery_worker still in registry",   !!getAgent("delivery_worker"),              null);
assert("build_worker still in registry",      !!getAgent("build_worker"),                 null);
assert("generation_worker still in registry", !!getAgent("generation_worker"),            null);
assert("repository_worker still in registry", !!getAgent("repository_worker"),            null);


// ─────────────────────────────────────────────────────────────────────────────
// Final
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  DEBUG WORKER TEST COMPLETE");
console.log("══════════════════════════════════════════════════════════\n");
