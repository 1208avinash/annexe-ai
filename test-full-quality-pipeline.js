// ── ANNEXE AI — Full Quality Pipeline Test ───────────────────────────────────
//
// Verifies the complete adapter context pipeline:
//
//   architect_worker
//         ↓  addArchitecture()
//   backend_worker
//         ↓  addBackendPlan()
//   frontend_worker
//         ↓  addFrontendPlan()
//   testing_worker
//         ↓  addTests()
//   review_worker
//         ↓  addReviews()
//
// Uses:
//   - Real runAgentAdapter() — no mocks
//   - Real projectContextManager singleton — no mocks
//   - Real agent functions — no mocks (stubs for testing/review)
//
// Run from project root:
//   node test-full-quality-pipeline.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { runAgentAdapter }       from "./lib/orchestrator/agent-adapters.js";
import { projectContextManager } from "./lib/orchestrator/context.js";


// ── Helpers ───────────────────────────────────────────────────────────────────

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
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 54 - title.length))}`);
}


// ── Shared project id ─────────────────────────────────────────────────────────

const PROJECT_ID = "crm-ai-platform";


// ── Task inputs ───────────────────────────────────────────────────────────────

const architectTask = {
  projectId:    PROJECT_ID,
  solution:     "AI CRM with lead qualification and automated follow-up",
  technology: {
    frontend:   { technology: "Next.js" },
    backend:    { technology: "FastAPI" },
    database:   { technology: "PostgreSQL" },
    aiLayer:    { technology: "LLM API with agent orchestration layer" },
    deployment: { technology: "Cloud deployment with CI/CD" }
  },
  requirements: {
    features:    ["authentication", "dashboard", "crm / contacts", "reporting", "ai / automation"],
    projectType: "crm",
    industry:    "SaaS"
  }
};

const backendTask = {
  projectId:    PROJECT_ID,
  solution:     architectTask.solution,
  // architecture intentionally omitted — adapter injects from context
  technology:   { backend: "FastAPI" },
  requirements: { features: ["authentication", "crm", "lead management", "AI"] }
};

const frontendTask = {
  projectId:    PROJECT_ID,
  solution:     architectTask.solution,
  // architecture + backendPlan intentionally omitted — adapter injects from context
  technology:   { frontend: "Next.js" },
  requirements: { features: ["dashboard", "crm", "authentication"] }
};

const testingTask = {
  projectId:    PROJECT_ID,
  solution:     architectTask.solution,
  // architecture + backendPlan + frontendPlan intentionally omitted
  requirements: { features: ["unit tests", "integration tests", "e2e tests"] }
};

const reviewTask = {
  projectId:    PROJECT_ID,
  solution:     architectTask.solution,
  // all plans + tests intentionally omitted — adapter injects from context
  requirements: { features: ["code review", "security review", "performance review"] }
};


// ── Run ───────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Full Quality Pipeline Test");
console.log("══════════════════════════════════════════════════════════");


// ── Stage 1: architect_worker ─────────────────────────────────────────────────

section("Stage 1 — architect_worker");

const archResult = await runAgentAdapter("architect_worker", architectTask);

assert("architect returns success",
  archResult.success === true,
  archResult.success
);
assert("architect returns architecture",
  !!archResult.architecture,
  null
);

const ctxAfterArch = projectContextManager.get(PROJECT_ID);

assert("context.architecture stored",
  !!ctxAfterArch.architecture,
  null
);
assert("context.backendPlan still null",
  ctxAfterArch.backendPlan === null,
  ctxAfterArch.backendPlan
);
assert("context.frontendPlan still null",
  ctxAfterArch.frontendPlan === null,
  ctxAfterArch.frontendPlan
);

console.log("\n  [TEST] Architecture stored");


// ── Stage 2: backend_worker ───────────────────────────────────────────────────

section("Stage 2 — backend_worker");

const backResult = await runAgentAdapter("backend_worker", backendTask);

assert("backend returns success",
  backResult.success === true,
  backResult.success
);
assert("backend returns backendPlan",
  !!backResult.backendPlan,
  null
);

const ctxAfterBackend = projectContextManager.get(PROJECT_ID);

assert("context.backendPlan stored",
  !!ctxAfterBackend.backendPlan,
  null
);
assert("context.architecture still intact",
  !!ctxAfterBackend.architecture,
  null
);
assert("context.frontendPlan still null",
  ctxAfterBackend.frontendPlan === null,
  ctxAfterBackend.frontendPlan
);

console.log("\n  [TEST] Backend plan stored");


// ── Stage 3: frontend_worker ──────────────────────────────────────────────────

section("Stage 3 — frontend_worker");

const frontResult = await runAgentAdapter("frontend_worker", frontendTask);

assert("frontend returns success",
  frontResult.success === true,
  frontResult.success
);
assert("frontend returns frontendPlan",
  !!frontResult.frontendPlan,
  null
);
assert("frontendPlan has pages",
  Array.isArray(frontResult.frontendPlan?.pages) &&
  frontResult.frontendPlan.pages.length > 0,
  frontResult.frontendPlan?.pages?.length
);

const ctxAfterFrontend = projectContextManager.get(PROJECT_ID);

assert("context.frontendPlan stored",
  !!ctxAfterFrontend.frontendPlan,
  null
);
assert("context.architecture still intact",
  !!ctxAfterFrontend.architecture,
  null
);
assert("context.backendPlan still intact",
  !!ctxAfterFrontend.backendPlan,
  null
);

console.log("\n  [TEST] Frontend plan stored");


// ── Stage 4: testing_worker ───────────────────────────────────────────────────

section("Stage 4 — testing_worker");

const testResult = await runAgentAdapter("testing_worker", testingTask);

assert("testing returns success",
  testResult.success === true,
  testResult.success
);
assert("testing returns tests array",
  Array.isArray(testResult.tests),
  testResult.tests
);

const ctxAfterTesting = projectContextManager.get(PROJECT_ID);

assert("context.tests is array",
  Array.isArray(ctxAfterTesting.tests),
  ctxAfterTesting.tests
);
assert("context.frontendPlan still intact",
  !!ctxAfterTesting.frontendPlan,
  null
);
assert("context.backendPlan still intact",
  !!ctxAfterTesting.backendPlan,
  null
);
assert("context.architecture still intact",
  !!ctxAfterTesting.architecture,
  null
);

console.log("\n  [TEST] Tests stored");


// ── Stage 5: review_worker ────────────────────────────────────────────────────

section("Stage 5 — review_worker");

const reviewResult = await runAgentAdapter("review_worker", reviewTask);

assert("review returns success",
  reviewResult.success === true,
  reviewResult.success
);
assert("review returns reviews array",
  Array.isArray(reviewResult.reviews),
  reviewResult.reviews
);

const ctxAfterReview = projectContextManager.get(PROJECT_ID);

assert("context.reviews is array",
  Array.isArray(ctxAfterReview.reviews),
  ctxAfterReview.reviews
);
assert("context.frontendPlan still intact",
  !!ctxAfterReview.frontendPlan,
  null
);
assert("context.backendPlan still intact",
  !!ctxAfterReview.backendPlan,
  null
);
assert("context.architecture still intact",
  !!ctxAfterReview.architecture,
  null
);

console.log("\n  [TEST] Reviews stored");


// ── Final context shape check ─────────────────────────────────────────────────

section("Final context shape");

const final = projectContextManager.get(PROJECT_ID);

assert("architecture exists",   !!final.architecture,              null);
assert("backendPlan exists",    !!final.backendPlan,               null);
assert("frontendPlan exists",   !!final.frontendPlan,              null);
assert("tests is array",        Array.isArray(final.tests),        final.tests);
assert("reviews is array",      Array.isArray(final.reviews),      final.reviews);
assert("files is empty array",  Array.isArray(final.files) &&
                                final.files.length === 0,          final.files);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log(`  ${failed === 0 ? "✅" : "❌"}  ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  FULL QUALITY PIPELINE TEST PASSED");
  console.log("  architect → backend → frontend → testing → review ✓");
} else {
  console.log("  SOME TESTS FAILED — check adapter or context.js");
  process.exit(1);
}

console.log("══════════════════════════════════════════════════════════\n");
