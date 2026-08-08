// ── ANNEXE AI — Frontend Enhancer Integration Test ────────────────────────────
//
// Verifies the full adapter pipeline:
//   architect_worker → backend_worker → frontend_worker (engineer + enhancer)
//
// Checks:
//   1. architect creates architecture and stores it in context
//   2. backend creates backendPlan and stores it in context
//   3. frontend engineer runs with enriched input
//   4. frontend enhancer runs after engineer
//   5. frontendPlan contains enhancements
//   6. context contains the enhanced frontendPlan
//
// Run: node test-frontend-enhancer-integration.js
// ─────────────────────────────────────────────────────────────────────────────

import { runAgentAdapter } from "./lib/orchestrator/agent-adapters.js";
import { projectContextManager } from "./lib/orchestrator/context.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 60 - title.length))}`);
}

// ── Shared test fixtures ──────────────────────────────────────────────────────

const PROJECT_ID  = "TEST-FE-ENHANCE-" + Date.now();

const SOLUTION    = "AI-powered CRM with lead management and automation";
const TECHNOLOGY = {
  frontend:   "Next.js",
  backend:    "FastAPI",
  database:   "PostgreSQL",
  aiLayer:    "LLM API with agent orchestration layer",
  deployment: "Cloud deployment with CI/CD"
};
const REQUIREMENTS = [
  "authentication",
  "dashboard",
  "crm / contacts",
  "notifications",
  "api / integrations"
];

// ── Test 1: Architect ─────────────────────────────────────────────────────────

section("Step 1 — architect_worker");

const archResult = await runAgentAdapter("architect_worker", {
  projectId:    PROJECT_ID,
  solution:     SOLUTION,
  technology:   TECHNOLOGY,
  requirements: REQUIREMENTS
});

assert("architect returns success",      archResult.success === true);
assert("architecture object present",    !!archResult.architecture);

const ctxAfterArch = projectContextManager.get(PROJECT_ID);
assert("architecture stored in context", !!ctxAfterArch.architecture);


// ── Test 2: Backend ───────────────────────────────────────────────────────────

section("Step 2 — backend_worker");

const backResult = await runAgentAdapter("backend_worker", {
  projectId:    PROJECT_ID,
  solution:     SOLUTION,
  technology:   TECHNOLOGY,
  requirements: REQUIREMENTS
  // architecture deliberately omitted — adapter must read from context
});

assert("backend returns success",        backResult.success === true);
assert("backendPlan object present",     !!backResult.backendPlan);

const ctxAfterBack = projectContextManager.get(PROJECT_ID);
assert("backendPlan stored in context",  !!ctxAfterBack.backendPlan);


// ── Test 3: Frontend ──────────────────────────────────────────────────────────

section("Step 3 — frontend_worker (engineer + enhancer)");

const frontResult = await runAgentAdapter("frontend_worker", {
  projectId:    PROJECT_ID,
  solution:     SOLUTION,
  technology:   TECHNOLOGY,
  requirements: REQUIREMENTS
  // architecture + backendPlan deliberately omitted — adapter must read from context
});

assert("frontend returns success",                   frontResult.success === true);
assert("frontendPlan object present",                !!frontResult.frontendPlan);
assert("frontendPlan contains enhancements key",     "enhancements" in (frontResult.frontendPlan || {}));
assert("enhancements is not null/undefined",         frontResult.frontendPlan?.enhancements != null);

const ctxAfterFront = projectContextManager.get(PROJECT_ID);
assert("frontendPlan stored in context",             !!ctxAfterFront.frontendPlan);
assert("context frontendPlan has enhancements key",  "enhancements" in (ctxAfterFront.frontendPlan || {}));

// Verify the context plan matches what the adapter returned
const plansMatch =
  JSON.stringify(ctxAfterFront.frontendPlan) ===
  JSON.stringify(frontResult.frontendPlan);
assert("context frontendPlan === returned frontendPlan", plansMatch);


// ── Test 4: Context integrity check ──────────────────────────────────────────

section("Step 4 — Full context integrity");

const finalCtx = projectContextManager.get(PROJECT_ID);

assert("context has architecture",   !!finalCtx.architecture);
assert("context has backendPlan",    !!finalCtx.backendPlan);
assert("context has frontendPlan",   !!finalCtx.frontendPlan);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(64)}`);
console.log(`Frontend Enhancer Integration — ${passed} passed, ${failed} failed`);
console.log(`${"─".repeat(64)}\n`);

if (failed > 0) process.exit(1);
