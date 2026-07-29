// ── ANNEXE AI — Generation Worker Adapter Test ────────────────────────────────
//
// Verifies generation_worker in the adapter pipeline:
//
//   1. Context contains backendPlan + frontendPlan (pre-seeded)
//   2. generation_worker executes via runAgentAdapter()
//   3. Backend generation pipeline runs
//   4. Frontend generation pipeline runs
//   5. generatedFiles array is returned (combined from both pipelines)
//   6. Return contract shape is correct
//
// Does NOT test repository, Git, or GitHub.
//
// Run: node test-generation-worker.js
// ─────────────────────────────────────────────────────────────────────────────

import { runAgentAdapter }        from "./api/orchestrator/agent-adapters.js";
import { projectContextManager }  from "./api/orchestrator/context.js";


// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}  →  got: ${JSON.stringify(actual)}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 60 - title.length))}`);
}


// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROJECT_ID = "GEN-WORKER-TEST-" + Date.now();

// Minimal backendPlan that satisfies runBackendGenerationPipeline()
const BACKEND_PLAN = {
  projectId:  PROJECT_ID,
  endpoints:  [
    { method: "GET",  path: "/health",    description: "Health check" },
    { method: "POST", path: "/api/login", description: "Auth login"   }
  ],
  models:     ["User", "Session"],
  services:   ["AuthService", "UserService"]
};

// Minimal frontendPlan that satisfies runFrontendGenerationPipeline()
const FRONTEND_PLAN = {
  projectId:  PROJECT_ID,
  pages:      [
    { name: "Dashboard", route: "/",      components: ["Header", "StatCard"] },
    { name: "Login",     route: "/login", components: ["LoginForm"]           }
  ],
  components: ["Header", "StatCard", "LoginForm"],
  styles:     { framework: "Tailwind" }
};


// ── Step 1: Seed context ──────────────────────────────────────────────────────

section("Step 1 — Seed context with backendPlan + frontendPlan");

projectContextManager.addBackendPlan(PROJECT_ID, BACKEND_PLAN);
projectContextManager.addFrontendPlan(PROJECT_ID, FRONTEND_PLAN);

const seeded = projectContextManager.get(PROJECT_ID);

assert("context has backendPlan",   !!seeded.backendPlan,   seeded.backendPlan);
assert("context has frontendPlan",  !!seeded.frontendPlan,  seeded.frontendPlan);


// ── Step 2: Run generation_worker ─────────────────────────────────────────────

section("Step 2 — Run generation_worker via runAgentAdapter()");

// Plans intentionally omitted from taskInput — adapter must read from context
const result = await runAgentAdapter("generation_worker", {
  projectId: PROJECT_ID
});

console.log("\n  [RESULT SHAPE]", {
  success:           result.success,
  agent:             result.agent,
  hasBackendGen:     !!result.backendGeneration,
  hasFrontendGen:    !!result.frontendGeneration,
  generatedFiles:    result.generatedFiles?.length ?? "missing"
});


// ── Step 3: Assert return contract ────────────────────────────────────────────

section("Step 3 — Return contract assertions");

assert("result.agent === 'generation_worker'",
  result.agent === "generation_worker",
  result.agent
);

assert("result.success is boolean",
  typeof result.success === "boolean",
  result.success
);

assert("result.backendGeneration present",
  result.backendGeneration !== undefined,
  result.backendGeneration
);

assert("result.frontendGeneration present",
  result.frontendGeneration !== undefined,
  result.frontendGeneration
);

assert("result.generatedFiles is array",
  Array.isArray(result.generatedFiles),
  result.generatedFiles
);


// ── Step 4: Pipeline execution evidence ──────────────────────────────────────

section("Step 4 — Pipeline execution evidence");

// Backend pipeline ran (returned an object, not undefined)
assert("backendGeneration is object",
  result.backendGeneration !== null &&
  typeof result.backendGeneration === "object",
  typeof result.backendGeneration
);

// Frontend pipeline ran
assert("frontendGeneration is object",
  result.frontendGeneration !== null &&
  typeof result.frontendGeneration === "object",
  typeof result.frontendGeneration
);

// generatedFiles combined from both pipelines
const backendFiles  = result.backendGeneration?.generatedFiles  || [];
const frontendFiles = result.frontendGeneration?.generatedFiles || [];
const expectedTotal = backendFiles.length + frontendFiles.length;

assert(`generatedFiles.length === backendFiles(${backendFiles.length}) + frontendFiles(${frontendFiles.length})`,
  result.generatedFiles.length === expectedTotal,
  result.generatedFiles.length
);


// ── Step 5: No-plan graceful handling ────────────────────────────────────────

section("Step 5 — No-plan graceful handling (empty project)");

const emptyResult = await runAgentAdapter("generation_worker", {
  projectId: "NONEXISTENT-PROJECT-" + Date.now()
});

// Both pipelines return { success: false, error: "...plan required" }
// adapter should still return an object with generatedFiles array
assert("empty project returns object",
  emptyResult !== null && typeof emptyResult === "object",
  emptyResult
);

assert("empty project generatedFiles is array",
  Array.isArray(emptyResult.generatedFiles),
  emptyResult.generatedFiles
);

assert("empty project agent field correct",
  emptyResult.agent === "generation_worker",
  emptyResult.agent
);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(60)}`);
console.log(`  Generation Worker Test — ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  ✅  GENERATION WORKER TEST PASSED");
  console.log("  backend pipeline ✓  frontend pipeline ✓  files combined ✓");
} else {
  console.log("  ❌  SOME TESTS FAILED");
  process.exit(1);
}

console.log(`${"═".repeat(60)}\n`);
