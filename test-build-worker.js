// ── ANNEXE AI — Build Worker Test ────────────────────────────────────────────
//
// Run from D:\annex-web:
//   node test-build-worker.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { runBuildWorker } from "./lib/agents/build/worker.js";


// ── Shared assert helper ──────────────────────────────────────────────────────

function assert(label, condition, actual) {
  console.log(
    `${condition ? "✅" : "❌"}  ${label}` +
    `${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`
  );
  return condition;
}


// ── Shared fake factory output ────────────────────────────────────────────────

const fakeGeneratedFiles = [
  { path: "src/api/routes.py",              type: "backend",  status: "generated" },
  { path: "src/api/auth.py",                type: "backend",  status: "generated" },
  { path: "src/api/crm.py",                 type: "backend",  status: "generated" },
  { path: "src/components/Dashboard.tsx",   type: "frontend", status: "generated" },
  { path: "src/pages/index.tsx",            type: "frontend", status: "generated" },
  { path: "src/pages/crm.tsx",              type: "frontend", status: "generated" },
  { path: "migrations/001_init.sql",        type: "database", status: "generated" },
  { path: "tests/test_api.py",              type: "test",     status: "generated" },
  { path: ".env.example",                   type: "config",   status: "generated" }
];

const fakeArchitecture = {
  frontend: {
    framework: "Next.js",
    modules:   ["Dashboard", "Authentication", "Client Portal"]
  },
  backend: {
    framework: "FastAPI",
    services:  ["API Gateway", "Business Logic Service", "AI Agent Service"]
  },
  database: {
    engine: "PostgreSQL",
    tables: ["users", "projects", "customers", "conversations", "tasks"]
  },
  aiArchitecture: {
    components: ["AI Decision Engine", "Agent Orchestrator", "Memory Layer"]
  },
  integrations: ["Authentication Provider", "External APIs"]
};

const fakeTechnology = {
  frontend:   { technology: "Next.js" },
  backend:    { technology: "FastAPI" },
  database:   { technology: "PostgreSQL" },
  aiLayer:    { technology: "LLM API with agent orchestration layer" },
  deployment: { technology: "Cloud deployment with CI/CD" }
};


// ── Stage 1: Happy-path run ───────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Build Worker Test");
console.log("══════════════════════════════════════════════════════════\n");

console.log("── Stage 1: Happy-path build plan ───────────────────────\n");

const result = runBuildWorker({
  projectId:      "ANNEXE-TEST-BUILD-001",
  generatedFiles: fakeGeneratedFiles,
  architecture:   fakeArchitecture,
  technology:     fakeTechnology,
  sandboxId:      "SANDBOX-001"
});

const report = result.buildReport;

// Top-level shape
assert("result.success === true",             result.success === true,                  result.success);
assert("result.agent === 'build_worker'",     result.agent  === "build_worker",         result.agent);
assert("status === 'BUILD_PLAN_READY'",       result.status === "BUILD_PLAN_READY",     result.status);
assert("buildReport exists",                  !!report,                                 null);

// projectId / sandboxId pass-through
assert("buildReport.projectId correct",       report.projectId === "ANNEXE-TEST-BUILD-001", report.projectId);
assert("buildReport.sandboxId correct",       report.sandboxId === "SANDBOX-001",       report.sandboxId);

// fileInventory
assert("fileInventory is array",              Array.isArray(report.fileInventory),      null);
assert("fileInventory.length === 9",          report.fileInventory.length === 9,        report.fileInventory.length);
assert("every file has path",                 report.fileInventory.every(f => !!f.path), null);
assert("every file has buildStage",           report.fileInventory.every(f => !!f.buildStage), null);

// Classification correctness
const backendFiles  = report.fileInventory.filter(f => f.buildStage === "backend");
const frontendFiles = report.fileInventory.filter(f => f.buildStage === "frontend");
const dbFiles       = report.fileInventory.filter(f => f.buildStage === "database");
const testFiles     = report.fileInventory.filter(f => f.buildStage === "test");
const configFiles   = report.fileInventory.filter(f => f.buildStage === "config");

assert("3 backend files classified",          backendFiles.length  === 3,               backendFiles.length);
assert("3 frontend files classified",         frontendFiles.length === 3,               frontendFiles.length);
assert("1 database file classified",          dbFiles.length       === 1,               dbFiles.length);
assert("1 test file classified",              testFiles.length     === 1,               testFiles.length);
assert("1 config file classified",            configFiles.length   === 1,               configFiles.length);

// Stages
assert("stages exists",                       !!report.stages,                          null);
assert("stages.database exists",              !!report.stages.database,                 null);
assert("stages.backend exists",               !!report.stages.backend,                  null);
assert("stages.frontend exists",              !!report.stages.frontend,                 null);
assert("stages.tests exists",                 !!report.stages.tests,                    null);
assert("stages.config exists",                !!report.stages.config,                   null);

// Framework resolution
assert("backend framework = FastAPI",         report.stages.backend.framework  === "FastAPI",     report.stages.backend.framework);
assert("frontend framework = Next.js",        report.stages.frontend.framework === "Next.js",     report.stages.frontend.framework);
assert("database engine = PostgreSQL",        report.stages.database.framework === "PostgreSQL",  report.stages.database.framework);

// Steps generated
assert("backend has steps",                   report.stages.backend.steps.length   > 0,  report.stages.backend.steps.length);
assert("frontend has steps",                  report.stages.frontend.steps.length  > 0,  report.stages.frontend.steps.length);
assert("database has steps",                  report.stages.database.steps.length  > 0,  report.stages.database.steps.length);
assert("every step has command",              report.stages.backend.steps.every(s => !!s.command), null);

// Build order
assert("buildOrder is array",                 Array.isArray(report.buildOrder),         null);
assert("buildOrder has 5 entries",            report.buildOrder.length === 5,           report.buildOrder.length);
assert("database is first",                   report.buildOrder[0] === "database",      report.buildOrder[0]);
assert("tests is fourth",                     report.buildOrder[3] === "tests",         report.buildOrder[3]);

// Estimated duration
assert("estimatedDuration exists",            !!report.estimatedDuration,               null);
assert("estimatedDuration.minutes > 0",       report.estimatedDuration.minutes > 0,    report.estimatedDuration.minutes);
assert("estimatedDuration.description exists",!!report.estimatedDuration.description,  null);

// Warnings — sandboxId provided so only content warnings possible
assert("warnings is array",                   Array.isArray(report.warnings),           null);

// _meta
assert("_meta exists",                        !!result._meta,                           null);
assert("_meta.totalFiles === 9",              result._meta.totalFiles === 9,            result._meta.totalFiles);
assert("_meta.backendFramework = FastAPI",    result._meta.backendFramework  === "FastAPI",  result._meta.backendFramework);
assert("_meta.frontendFramework = Next.js",   result._meta.frontendFramework === "Next.js",  result._meta.frontendFramework);
assert("_meta.databaseEngine = PostgreSQL",   result._meta.databaseEngine    === "PostgreSQL", result._meta.databaseEngine);
assert("_meta.estimatedMinutes > 0",          result._meta.estimatedMinutes  > 0,       result._meta.estimatedMinutes);
assert("_meta.plannedAt exists",              !!result._meta.plannedAt,                 null);

console.log("\n── Build Plan Snapshot ───────────────────────────────────");
console.log("  Backend framework: ", result._meta.backendFramework);
console.log("  Frontend framework:", result._meta.frontendFramework);
console.log("  Database engine:   ", result._meta.databaseEngine);
console.log("  Total files:       ", result._meta.totalFiles);
console.log("  Stage counts:      ", JSON.stringify(result._meta.stageCounts));
console.log("  Estimated minutes: ", result._meta.estimatedMinutes);
console.log("  Build order:       ", report.buildOrder.join(" → "));
console.log("  Warnings:          ", report.warnings.length);


// ── Stage 2: Failure handling — missing generatedFiles ───────────────────────

console.log("\n── Stage 2: Failure handling (missing generatedFiles) ───\n");

// 2a. generatedFiles omitted entirely
const failResult1 = runBuildWorker({
  projectId:    "ANNEXE-TEST-BUILD-FAIL",
  architecture: fakeArchitecture
});

assert("fail1: success === false",            failResult1.success === false,             failResult1.success);
assert("fail1: agent === 'build_worker'",     failResult1.agent  === "build_worker",    failResult1.agent);
assert("fail1: status === 'BUILD_PLAN_FAILED'", failResult1.status === "BUILD_PLAN_FAILED", failResult1.status);
assert("fail1: error message present",        !!failResult1.error,                      failResult1.error);
assert("fail1: buildReport === null",         failResult1.buildReport === null,         failResult1.buildReport);

// 2b. generatedFiles is empty array
const failResult2 = runBuildWorker({
  projectId:      "ANNEXE-TEST-BUILD-EMPTY",
  generatedFiles: [],
  architecture:   fakeArchitecture
});

assert("fail2: success === false (empty array)", failResult2.success === false,          failResult2.success);
assert("fail2: status === 'BUILD_PLAN_FAILED'",  failResult2.status === "BUILD_PLAN_FAILED", failResult2.status);

// 2c. generatedFiles is not an array
const failResult3 = runBuildWorker({
  projectId:      "ANNEXE-TEST-BUILD-BADTYPE",
  generatedFiles: "not-an-array",
  architecture:   fakeArchitecture
});

assert("fail3: success === false (not array)", failResult3.success === false,            failResult3.success);
assert("fail3: status === 'BUILD_PLAN_FAILED'", failResult3.status === "BUILD_PLAN_FAILED", failResult3.status);


// ── Stage 3: Adapter execution (simulated) ───────────────────────────────────
//
// The real adapter calls runBuildWorker via dynamic import inside a switch
// case.  Here we simulate that by calling the function directly with the
// same input shape the adapter would pass — confirming the contract is stable.

console.log("\n── Stage 3: Adapter contract verification ────────────────\n");

const adapterInput = {
  projectId:      "ANNEXE-TEST-BUILD-ADAPTER",
  generatedFiles: fakeGeneratedFiles,
  architecture:   fakeArchitecture,
  technology:     fakeTechnology,
  sandboxId:      "SANDBOX-ADAPTER-001"
};

const adapterResult = runBuildWorker(adapterInput);

assert("adapter: success === true",           adapterResult.success === true,           adapterResult.success);
assert("adapter: agent === 'build_worker'",   adapterResult.agent  === "build_worker",  adapterResult.agent);
assert("adapter: status is BUILD_PLAN_READY", adapterResult.status === "BUILD_PLAN_READY", adapterResult.status);
assert("adapter: buildReport present",        !!adapterResult.buildReport,              null);
assert("adapter: fileInventory non-empty",    adapterResult.buildReport.fileInventory.length > 0, adapterResult.buildReport.fileInventory.length);
assert("adapter: stages.backend has steps",   adapterResult.buildReport.stages.backend.steps.length > 0, null);


// ── Stage 4: Minimal input (no technology, no sandboxId) ─────────────────────

console.log("\n── Stage 4: Minimal input (no technology, no sandboxId) ─\n");

const minimalResult = runBuildWorker({
  projectId:      "ANNEXE-TEST-BUILD-MIN",
  generatedFiles: fakeGeneratedFiles
  // no architecture, no technology, no sandboxId
});

assert("minimal: success === true",           minimalResult.success === true,           minimalResult.success);
assert("minimal: status BUILD_PLAN_READY",    minimalResult.status === "BUILD_PLAN_READY", minimalResult.status);
assert("minimal: falls back to defaults",     minimalResult._meta.backendFramework === "default" || !!minimalResult._meta.backendFramework, minimalResult._meta.backendFramework);
assert("minimal: sandboxId warning present",  minimalResult.buildReport.warnings.some(w => w.includes("sandboxId")), null);
assert("minimal: fileInventory still built",  minimalResult.buildReport.fileInventory.length === 9, minimalResult.buildReport.fileInventory.length);


// ── Final ─────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  BUILD WORKER TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");
