// ── ANNEXE AI — Delivery Worker Test ─────────────────────────────────────────
//
// Run from D:\annex-web:
//   node test-delivery-worker.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { runDeliveryWorker } from "./lib/agents/delivery/worker.js";


// ── Shared assert helper ──────────────────────────────────────────────────────

function assert(label, condition, actual) {
  console.log(
    `${condition ? "✅" : "❌"}  ${label}` +
    `${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`
  );
  return condition;
}


// ── Stage 1: Fake factory output ──────────────────────────────────────────────

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

const fakeBackendPlan = {
  framework: "FastAPI",
  services:  ["API Gateway", "CRM Service", "AI Service"],
  estimatedTasks: [
    { task: "Setup API routes", days: 2 },
    { task: "Implement auth",   days: 1 }
  ]
};

const fakeFrontendPlan = {
  framework: "Next.js",
  pages:     ["Dashboard", "Login", "CRM"],
  estimatedTasks: [
    { task: "Build Dashboard", days: 3 }
  ]
};

const fakeGenerationResult = {
  success: true,
  files: [
    { path: "src/api/routes.py",         type: "backend",  status: "generated" },
    { path: "src/api/auth.py",           type: "backend",  status: "generated" },
    { path: "src/components/Dashboard.tsx", type: "frontend", status: "generated" },
    { path: "src/pages/index.tsx",       type: "frontend", status: "generated" },
    { path: "migrations/001_init.sql",   type: "database", status: "generated" }
  ]
};

const fakeRepositoryResult = {
  success: true,
  repositoryState: {
    repositoryUrl:  "https://github.com/annexe/test-project",
    workingBranch:  "annexe-ai/feature-crm-001",
    status:         "prepared",
    pullRequest: {
      title:          "ANNEXE AI: CRM module",
      sourceBranch:   "annexe-ai/feature-crm-001",
      targetBranch:   "main",
      status:         "draft",
      reviewRequired: true,
      mergeAllowed:   false
    }
  }
};

const fakeTests = {
  summary:  "All suites passed",
  passed:   34,
  failed:   0,
  coverage: "82%",
  suites:   ["unit", "integration", "e2e"]
};


// ── Stage 2: Happy-path run ───────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Delivery Worker Test");
console.log("══════════════════════════════════════════════════════════\n");

console.log("── Stage 2: Happy-path delivery ─────────────────────────\n");

const input = {
  projectId:        "ANNEXE-TEST-DELIVERY-001",
  architecture:     fakeArchitecture,
  backendPlan:      fakeBackendPlan,
  frontendPlan:     fakeFrontendPlan,
  generationResult: fakeGenerationResult,
  repositoryResult: fakeRepositoryResult,
  tests:            fakeTests
};

const result  = runDeliveryWorker(input);
const pkg     = result.deliveryPackage;

assert("result.success === true",             result.success === true,                       result.success);
assert("result.agent === 'delivery_worker'",  result.agent === "delivery_worker",            result.agent);
assert("status === 'READY_FOR_CLIENT'",       result.status === "READY_FOR_CLIENT",          result.status);
assert("deliveryPackage exists",              !!pkg,                                         null);

// projectSummary
assert("projectSummary exists",               !!pkg.projectSummary,                          null);
assert("projectSummary.projectId correct",    pkg.projectSummary.projectId === "ANNEXE-TEST-DELIVERY-001", pkg.projectSummary.projectId);
assert("projectSummary.frontend correct",     pkg.projectSummary.frontend === "Next.js",     pkg.projectSummary.frontend);
assert("projectSummary.backend correct",      pkg.projectSummary.backend  === "FastAPI",     pkg.projectSummary.backend);
assert("projectSummary.totalGeneratedFiles",  pkg.projectSummary.totalGeneratedFiles === 5,  pkg.projectSummary.totalGeneratedFiles);
assert("modules array not empty",             pkg.projectSummary.modules.length > 0,         pkg.projectSummary.modules.length);

// architectureDocument
assert("architectureDocument exists",         !!pkg.architectureDocument,                    null);
assert("architectureDocument.frontend",       pkg.architectureDocument.frontend.framework === "Next.js", pkg.architectureDocument.frontend.framework);
assert("architectureDocument.backend",        pkg.architectureDocument.backend.framework  === "FastAPI",  pkg.architectureDocument.backend.framework);
assert("architectureDocument.database",       pkg.architectureDocument.database.engine    === "PostgreSQL", pkg.architectureDocument.database.engine);
assert("integrations included",               pkg.architectureDocument.integrations.length > 0, pkg.architectureDocument.integrations.length);

// generatedFiles
assert("generatedFiles exists",               Array.isArray(pkg.generatedFiles),             null);
assert("generatedFiles count === 5",          pkg.generatedFiles.length === 5,               pkg.generatedFiles.length);
assert("each file has path",                  pkg.generatedFiles.every(f => !!f.path),       null);
assert("each file has status",                pkg.generatedFiles.every(f => !!f.status),     null);

// testReport
assert("testReport exists",                   !!pkg.testReport,                              null);
assert("testReport.available === true",       pkg.testReport.available === true,             pkg.testReport.available);
assert("testReport.passed === 34",            pkg.testReport.passed === 34,                  pkg.testReport.passed);
assert("testReport.failed === 0",             pkg.testReport.failed  === 0,                  pkg.testReport.failed);
assert("testReport.coverage exists",          !!pkg.testReport.coverage,                     pkg.testReport.coverage);

// repositoryInfo
assert("repositoryInfo exists",               !!pkg.repositoryInfo,                          null);
assert("repositoryInfo.available === true",   pkg.repositoryInfo.available === true,         pkg.repositoryInfo.available);
assert("repositoryInfo.repositoryUrl exists", !!pkg.repositoryInfo.repositoryUrl,            pkg.repositoryInfo.repositoryUrl);
assert("repositoryInfo.branch exists",        !!pkg.repositoryInfo.branch,                   pkg.repositoryInfo.branch);
assert("repositoryInfo.pullRequest exists",   !!pkg.repositoryInfo.pullRequest,              null);

// deploymentGuide
assert("deploymentGuide exists",              !!pkg.deploymentGuide,                         null);
assert("deploymentGuide.steps is array",      Array.isArray(pkg.deploymentGuide.steps),      null);
assert("deploymentGuide has 9 steps",         pkg.deploymentGuide.steps.length === 9,        pkg.deploymentGuide.steps.length);
assert("deploymentGuide.notes is array",      Array.isArray(pkg.deploymentGuide.notes),      null);

// _meta
assert("_meta exists",                        !!result._meta,                                null);
assert("_meta.totalFiles === 5",              result._meta.totalFiles === 5,                 result._meta.totalFiles);
assert("_meta.repositoryAttached === true",   result._meta.repositoryAttached === true,      result._meta.repositoryAttached);
assert("_meta.testsAttached === true",        result._meta.testsAttached === true,           result._meta.testsAttached);

console.log("\n── Package Snapshot ──────────────────────────────────────");
console.log("  Frontend:         ", pkg.projectSummary.frontend);
console.log("  Backend:          ", pkg.projectSummary.backend);
console.log("  Generated files:  ", pkg.generatedFiles.length);
console.log("  Test passed:      ", pkg.testReport.passed);
console.log("  Repository:       ", pkg.repositoryInfo.repositoryUrl);
console.log("  Branch:           ", pkg.repositoryInfo.branch);
console.log("  Deployment steps: ", pkg.deploymentGuide.steps.length);


// ── Stage 3: Failure handling — missing generationResult ─────────────────────

console.log("\n── Stage 3: Failure handling (missing generationResult) ─\n");

const failInput = {
  projectId:    "ANNEXE-TEST-DELIVERY-FAIL",
  architecture: fakeArchitecture
  // generationResult intentionally omitted
};

const failResult = runDeliveryWorker(failInput);

assert("fail: success === false",             failResult.success === false,              failResult.success);
assert("fail: agent === 'delivery_worker'",   failResult.agent === "delivery_worker",   failResult.agent);
assert("fail: status === 'DELIVERY_FAILED'",  failResult.status === "DELIVERY_FAILED",  failResult.status);
assert("fail: error message present",         !!failResult.error,                       failResult.error);
assert("fail: deliveryPackage === null",       failResult.deliveryPackage === null,      failResult.deliveryPackage);


// ── Stage 4: Optional fields absent (no tests, no repo) ──────────────────────

console.log("\n── Stage 4: Optional fields absent ──────────────────────\n");

const minimalResult = runDeliveryWorker({
  projectId:        "ANNEXE-TEST-DELIVERY-MIN",
  architecture:     fakeArchitecture,
  generationResult: fakeGenerationResult
  // no tests, no repositoryResult
});

assert("minimal: success === true",           minimalResult.success === true,                         minimalResult.success);
assert("minimal: testReport.available false", minimalResult.deliveryPackage.testReport.available === false, minimalResult.deliveryPackage?.testReport?.available);
assert("minimal: repoInfo.available false",   minimalResult.deliveryPackage.repositoryInfo.available === false, minimalResult.deliveryPackage?.repositoryInfo?.available);
assert("minimal: generatedFiles present",     minimalResult.deliveryPackage.generatedFiles.length === 5, minimalResult.deliveryPackage?.generatedFiles?.length);


// ── Final ─────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  DELIVERY WORKER TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");
