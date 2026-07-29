// ── ANNEXE AI — Agent Adapter Context Flow Test ───────────────────────────────
//
// Verifies the real adapter pipeline context plumbing:
//
//   architect_worker
//         ↓
//   projectContextManager.addArchitecture()
//         ↓
//   backend_worker
//         ↓
//   projectContextManager.addBackendPlan()
//         ↓
//   frontend_worker  (reads architecture + backendPlan from context)
//
// Uses:
//   - Real runAgentAdapter() — no mocks
//   - Real projectContextManager singleton — no mocks
//   - Real agent functions — no mocks
//
// Run from project root:
//   node test-agent-context-flow.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { runAgentAdapter }       from "./api/orchestrator/agent-adapters.js";
import { projectContextManager } from "./api/orchestrator/context.js";


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


// ── Shared task inputs (matches shapes the real agents expect) ────────────────

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
  // architecture intentionally omitted — adapter must inject it from context
  technology: {
    backend: "FastAPI"
  },
  requirements: {
    features: ["authentication", "crm", "lead management", "AI"]
  }
};

const frontendTask = {
  projectId:    PROJECT_ID,
  solution:     architectTask.solution,
  // architecture and backendPlan intentionally omitted — adapter must inject both
  technology: {
    frontend: "Next.js"
  },
  requirements: {
    features: ["dashboard", "crm", "authentication"]
  }
};


// ── Run ───────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Agent Adapter Context Flow Test");
console.log("══════════════════════════════════════════════════════════");


// ── Stage 1: architect_worker ─────────────────────────────────────────────────

section("Stage 1 — architect_worker");

const archResult = await runAgentAdapter("architect_worker", architectTask);

assert("architect returns success",
  archResult.success === true,
  archResult.success
);

assert("architect returns architecture object",
  !!archResult.architecture,
  null
);

// Verify context was written by the adapter
const ctxAfterArch = projectContextManager.get(PROJECT_ID);

assert("context.architecture stored after architect",
  !!ctxAfterArch.architecture,
  null
);

assert("context.architecture.frontend present",
  !!ctxAfterArch.architecture?.frontend,
  null
);

assert("context.architecture.backend present",
  !!ctxAfterArch.architecture?.backend,
  null
);

assert("context.backendPlan still null after architect",
  ctxAfterArch.backendPlan === null,
  ctxAfterArch.backendPlan
);

console.log("\n  [TEST] Architecture stored");
console.log("  frontend framework:", ctxAfterArch.architecture?.frontend?.framework || "—");
console.log("  backend framework: ", ctxAfterArch.architecture?.backend?.framework  || "—");


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

assert("backendPlan has framework",
  !!backResult.backendPlan?.framework,
  backResult.backendPlan?.framework
);

assert("backendPlan has services array",
  Array.isArray(backResult.backendPlan?.services) &&
  backResult.backendPlan.services.length > 0,
  backResult.backendPlan?.services?.length
);

// Verify context was written by the adapter
const ctxAfterBackend = projectContextManager.get(PROJECT_ID);

assert("context.backendPlan stored after backend",
  !!ctxAfterBackend.backendPlan,
  null
);

assert("context.architecture still intact after backend",
  !!ctxAfterBackend.architecture,
  null
);

assert("context.backendPlan.framework matches result",
  ctxAfterBackend.backendPlan?.framework === backResult.backendPlan?.framework,
  ctxAfterBackend.backendPlan?.framework
);

console.log("\n  [TEST] Backend plan stored");
console.log("  framework:  ", ctxAfterBackend.backendPlan?.framework || "—");
console.log("  services:   ", ctxAfterBackend.backendPlan?.services?.length, "services");


// ── Stage 3: frontend_worker ──────────────────────────────────────────────────

section("Stage 3 — frontend_worker");

// frontendTask has NO architecture or backendPlan — adapter must inject from context
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

assert("frontendPlan has components",
  Array.isArray(frontResult.frontendPlan?.components) &&
  frontResult.frontendPlan.components.length > 0,
  frontResult.frontendPlan?.components?.length
);

// Verify the context the frontend adapter read was fully populated
const ctxAfterFrontend = projectContextManager.get(PROJECT_ID);

assert("context still has architecture after frontend",
  !!ctxAfterFrontend.architecture,
  null
);

assert("context still has backendPlan after frontend",
  !!ctxAfterFrontend.backendPlan,
  null
);

console.log("\n  [TEST] Frontend received context");
console.log("  pages:      ", frontResult.frontendPlan?.pages?.length, "pages");
console.log("  components: ", frontResult.frontendPlan?.components?.length, "components");


// ── Final context integrity check ─────────────────────────────────────────────

section("Final context integrity");

const finalCtx = projectContextManager.get(PROJECT_ID);

assert("final context has projectId",
  finalCtx.projectId === PROJECT_ID,
  finalCtx.projectId
);

assert("final context.architecture intact",
  !!finalCtx.architecture,
  null
);

assert("final context.backendPlan intact",
  !!finalCtx.backendPlan,
  null
);

assert("no context bleed — files still empty array",
  Array.isArray(finalCtx.files) && finalCtx.files.length === 0,
  finalCtx.files
);

assert("no context bleed — tests still empty array",
  Array.isArray(finalCtx.tests) && finalCtx.tests.length === 0,
  finalCtx.tests
);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log(`  ${failed === 0 ? "✅" : "❌"}  ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  AGENT CONTEXT FLOW TEST PASSED");
  console.log("  Pipeline: architect → backend → frontend ✓");
} else {
  console.log("  SOME TESTS FAILED — check adapter or context.js");
  process.exit(1);
}

console.log("══════════════════════════════════════════════════════════\n");
