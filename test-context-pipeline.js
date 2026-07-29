// ── ANNEXE AI — Context Pipeline Test ────────────────────────────────────────
//
// Tests the backend → context → frontend plumbing in isolation.
// Does NOT run the full workflow engine.
//
// Run from project root:
//   node test-context-pipeline.js
//
// What it verifies:
//   1. context.create()          — initialises backendPlan: null
//   2. context.addArchitecture() — stores architecture, logs correctly
//   3. context.addBackendPlan()  — stores backendPlan, logs correctly
//   4. context.get()             — returns both fields on the same object
//   5. Frontend enrichment       — adapter merges architecture + backendPlan
//   6. Auto-create on get()      — missing project returns safe default
//   7. Isolation                 — two projects don't bleed into each other
//
// ─────────────────────────────────────────────────────────────────────────────

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


// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROJECT_ID = "crm-ai-platform";
const OTHER_ID   = "other-project";

const MOCK_ARCHITECTURE = {
  frontend:  { framework: "Next.js",    modules:  ["Dashboard", "Auth", "Client Portal"] },
  backend:   { framework: "FastAPI",    services: ["API Gateway", "AI Agent Service"] },
  database:  { engine:    "PostgreSQL", tables:   ["users", "leads", "conversations"] },
  aiArchitecture: { components: ["Agent Orchestrator", "Memory Layer"] }
};

const MOCK_BACKEND_PLAN = {
  backendId:  "BACKEND-TEST-001",
  framework:  "FastAPI",
  services:   ["CRM Service", "Lead Service", "AI Service", "Auth Service"],
  apis:       ["/auth", "/leads", "/crm", "/ai"],
  estimatedTotalDays: 22
};


// ── Test suite ────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Context Pipeline Test");
console.log("══════════════════════════════════════════════════════════");


// 1. Create context ────────────────────────────────────────────────────────────

section("1. context.create()");

const ctx = projectContextManager.create(PROJECT_ID);

assert("returns object",              !!ctx,                              ctx);
assert("projectId matches",           ctx.projectId === PROJECT_ID,       ctx.projectId);
assert("architecture starts null",    ctx.architecture === null,          ctx.architecture);
assert("backendPlan starts null",     ctx.backendPlan  === null,          ctx.backendPlan);
assert("files starts as array",       Array.isArray(ctx.files),           ctx.files);
assert("tests starts as array",       Array.isArray(ctx.tests),           ctx.tests);
assert("reviews starts as array",     Array.isArray(ctx.reviews),         ctx.reviews);
assert("createdAt is set",            !!ctx.createdAt,                    ctx.createdAt);


// 2. addArchitecture ───────────────────────────────────────────────────────────

section("2. addArchitecture()");

const afterArch = projectContextManager.addArchitecture(PROJECT_ID, MOCK_ARCHITECTURE);

assert("returns updated context",     !!afterArch,                                     afterArch);
assert("architecture stored",         !!afterArch.architecture,                        null);
assert("frontend framework correct",  afterArch.architecture?.frontend?.framework === "Next.js",
                                      afterArch.architecture?.frontend?.framework);
assert("backendPlan still null",      afterArch.backendPlan === null,                  afterArch.backendPlan);
assert("updatedAt refreshed",         !!afterArch.updatedAt,                           afterArch.updatedAt);


// 3. addBackendPlan ────────────────────────────────────────────────────────────

section("3. addBackendPlan()");

const afterBackend = projectContextManager.addBackendPlan(PROJECT_ID, MOCK_BACKEND_PLAN);

assert("returns updated context",     !!afterBackend,                                  afterBackend);
assert("backendPlan stored",          !!afterBackend.backendPlan,                      null);
assert("framework correct",           afterBackend.backendPlan?.framework === "FastAPI",
                                      afterBackend.backendPlan?.framework);
assert("services array present",      Array.isArray(afterBackend.backendPlan?.services),
                                      afterBackend.backendPlan?.services);
assert("architecture still intact",   !!afterBackend.architecture,                     null);
assert("arch frontend still correct", afterBackend.architecture?.frontend?.framework === "Next.js",
                                      afterBackend.architecture?.frontend?.framework);


// 4. context.get() returns both fields ────────────────────────────────────────

section("4. get() returns full context");

const retrieved = projectContextManager.get(PROJECT_ID);

assert("same projectId",              retrieved.projectId === PROJECT_ID,              retrieved.projectId);
assert("architecture present",        !!retrieved.architecture,                        null);
assert("backendPlan present",         !!retrieved.backendPlan,                         null);
assert("backend services count",      retrieved.backendPlan?.services?.length === 4,  retrieved.backendPlan?.services?.length);


// 5. Simulate frontend adapter enrichment ──────────────────────────────────────

section("5. Frontend adapter enrichment simulation");

// This mirrors exactly what the frontend_worker case does in agent-adapters.js
const taskInput = {
  projectId:    PROJECT_ID,
  requirements: { features: ["dashboard", "crm", "authentication"] },
  technology:   { frontend: "Next.js" }
  // architecture and backendPlan intentionally absent — adapter must inject them
};

const ctx2 = projectContextManager.get(taskInput.projectId);

const enrichedInput = {
  ...taskInput,
  architecture: taskInput.architecture || ctx2.architecture || null,
  backendPlan:  taskInput.backendPlan  || ctx2.backendPlan  || null,
  context:      ctx2
};

assert("enriched architecture present",   !!enrichedInput.architecture,                     null);
assert("enriched backendPlan present",    !!enrichedInput.backendPlan,                      null);
assert("original requirements kept",      Array.isArray(enrichedInput.requirements?.features),
                                          enrichedInput.requirements?.features);
assert("hasArchitecture === true",        !!enrichedInput.architecture === true,             !!enrichedInput.architecture);
assert("hasBackendPlan === true",         !!enrichedInput.backendPlan  === true,             !!enrichedInput.backendPlan);

// Replicate the exact console.log from the adapter so you can compare output
console.log("\n  [FRONTEND ADAPTER INPUT]", {
  projectId:       enrichedInput.projectId,
  hasArchitecture: !!enrichedInput.architecture,
  hasBackendPlan:  !!enrichedInput.backendPlan
});


// 6. Auto-create on get() for unknown project ──────────────────────────────────

section("6. Auto-create on get() for unknown project");

const ghost = projectContextManager.get("unknown-project-xyz");

assert("returns object (not null)",   !!ghost,                           ghost);
assert("architecture defaults null",  ghost.architecture === null,       ghost.architecture);
assert("backendPlan defaults null",   ghost.backendPlan  === null,       ghost.backendPlan);


// 7. Project isolation ─────────────────────────────────────────────────────────

section("7. Project isolation — two projects don't bleed");

projectContextManager.create(OTHER_ID);
projectContextManager.addBackendPlan(OTHER_ID, { framework: "Express", services: ["API"] });

const original = projectContextManager.get(PROJECT_ID);
const other    = projectContextManager.get(OTHER_ID);

assert("original backendPlan unchanged",  original.backendPlan?.framework === "FastAPI", original.backendPlan?.framework);
assert("other backendPlan is Express",    other.backendPlan?.framework    === "Express", other.backendPlan?.framework);
assert("original architecture intact",    !!original.architecture,                       null);
assert("other architecture is null",      other.architecture === null,                   other.architecture);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log(`  ${failed === 0 ? "✅" : "❌"}  ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  CONTEXT PIPELINE TEST PASSED");
  console.log("  Safe to integrate agent-adapters.js patch.");
} else {
  console.log("  SOME TESTS FAILED — review context.js before integrating.");
  process.exit(1);
}

console.log("══════════════════════════════════════════════════════════\n");
