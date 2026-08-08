// ── ANNEXE AI — Autonomous Software Factory Integration Test ──────────────────
//
// Executes the complete ANNEXE AI pipeline end-to-end using real adapters:
//
//   Stage 1: architect_worker   → architecture
//   Stage 2: backend_worker     → backendPlan
//   Stage 3: frontend_worker    → frontendPlan
//   Stage 4: generation_worker  → generatedFiles
//   Stage 5: repository_worker  → branch + commit + pullRequest
//
// No mocks. Real adapters. Real agents.
//
// Run: node test-autonomous-software-factory.js
// ─────────────────────────────────────────────────────────────────────────────

import { runAgentAdapter }       from "./lib/orchestrator/agent-adapters.js";
import { projectContextManager } from "./lib/orchestrator/context.js";


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
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 56 - title.length))}`);
}


// ── Project fixture ───────────────────────────────────────────────────────────

const PROJECT_ID = "FACTORY-TEST-" + Date.now();

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
  // architecture intentionally omitted — adapter reads from context
  technology:   { backend: "FastAPI" },
  requirements: { features: ["authentication", "crm", "lead management", "AI"] }
};

const frontendTask = {
  projectId:    PROJECT_ID,
  solution:     architectTask.solution,
  // architecture + backendPlan intentionally omitted — adapter reads from context
  technology:   { frontend: "Next.js" },
  requirements: { features: ["dashboard", "crm", "authentication"] }
};


// ── Run ───────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Autonomous Software Factory Test");
console.log(`  Project: ${PROJECT_ID}`);
console.log("══════════════════════════════════════════════════════════");


// ── Stage 1: architect_worker ─────────────────────────────────────────────────

section("Stage 1 — architect_worker");

const archResult = await runAgentAdapter("architect_worker", architectTask);

assert("success",
  archResult.success === true,
  archResult.success
);

assert("architecture returned",
  !!archResult.architecture,
  null
);

const ctxAfterArch = projectContextManager.get(PROJECT_ID);

assert("context contains architecture",
  !!ctxAfterArch.architecture,
  null
);

console.log(`\n  architecture.frontend: ${ctxAfterArch.architecture?.frontend?.framework || "—"}`);
console.log(`  architecture.backend:  ${ctxAfterArch.architecture?.backend?.framework  || "—"}`);


// ── Stage 2: backend_worker ───────────────────────────────────────────────────

section("Stage 2 — backend_worker");

const backResult = await runAgentAdapter("backend_worker", backendTask);

assert("success",
  backResult.success === true,
  backResult.success
);

assert("backendPlan exists",
  !!backResult.backendPlan,
  null
);

const ctxAfterBackend = projectContextManager.get(PROJECT_ID);

assert("context contains backendPlan",
  !!ctxAfterBackend.backendPlan,
  null
);

console.log(`\n  backendPlan.framework: ${ctxAfterBackend.backendPlan?.framework || "—"}`);
console.log(`  backendPlan.services:  ${ctxAfterBackend.backendPlan?.services?.length ?? "—"} services`);


// ── Stage 3: frontend_worker ──────────────────────────────────────────────────

section("Stage 3 — frontend_worker");

const frontResult = await runAgentAdapter("frontend_worker", frontendTask);

assert("success",
  frontResult.success === true,
  frontResult.success
);

assert("frontendPlan exists",
  !!frontResult.frontendPlan,
  null
);

const ctxAfterFrontend = projectContextManager.get(PROJECT_ID);

assert("context contains frontendPlan",
  !!ctxAfterFrontend.frontendPlan,
  null
);

console.log(`\n  frontendPlan.pages:      ${frontResult.frontendPlan?.pages?.length ?? "—"} pages`);
console.log(`  frontendPlan.components: ${frontResult.frontendPlan?.components?.length ?? "—"} components`);


// ── Stage 4: generation_worker ────────────────────────────────────────────────

section("Stage 4 — generation_worker");

// Plans omitted from taskInput — adapter reads backendPlan + frontendPlan from context
const genResult = await runAgentAdapter("generation_worker", {
  projectId: PROJECT_ID
});

assert("success",
  genResult.success === true,
  genResult.success
);

assert("backendGeneration exists",
  !!genResult.backendGeneration,
  null
);

assert("frontendGeneration exists",
  !!genResult.frontendGeneration,
  null
);

assert("generatedFiles is array",
  Array.isArray(genResult.generatedFiles),
  genResult.generatedFiles
);

assert("generatedFiles.length > 0",
  Array.isArray(genResult.generatedFiles) && genResult.generatedFiles.length > 0,
  genResult.generatedFiles?.length
);

console.log(`\n  generatedFiles: ${genResult.generatedFiles?.length ?? "—"} total`);
console.log(`  backend files:  ${genResult.backendGeneration?.generatedFiles?.length  ?? "—"}`);
console.log(`  frontend files: ${genResult.frontendGeneration?.generatedFiles?.length ?? "—"}`);


// ── Stage 5: repository_worker ────────────────────────────────────────────────

section("Stage 5 — repository_worker");

const repoResult = await runAgentAdapter("repository_worker", {
  projectId:        PROJECT_ID,
  task:             { id: PROJECT_ID, name: "ANNEXE AI Factory Generation" },
  generationResult: genResult
});

assert("success",
  repoResult.success === true,
  repoResult.success
);

assert("agent === 'repository_worker'",
  repoResult.agent === "repository_worker",
  repoResult.agent
);

assert("status === 'READY_FOR_REVIEW'",
  repoResult.status === "READY_FOR_REVIEW",
  repoResult.status
);

assert("repository.branch exists",
  !!repoResult.repository?.branch,
  null
);

assert("repository.commit exists",
  !!repoResult.repository?.commit,
  null
);

assert("repository.pullRequest exists",
  !!repoResult.repository?.pullRequest,
  null
);

console.log(`\n  branch:      ${repoResult.repository?.branch?.name || JSON.stringify(repoResult.repository?.branch)?.slice(0, 60) || "—"}`);
console.log(`  files:       ${repoResult.generatedFiles ?? "—"}`);
console.log(`  PR status:   ${repoResult.repository?.pullRequest?.status || repoResult.status || "—"}`);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log(`  ${failed === 0 ? "✅" : "❌"}  ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  AUTONOMOUS SOFTWARE FACTORY TEST PASSED");
  console.log("  architect → backend → frontend → generation → repository ✓");
} else {
  console.log("  SOME TESTS FAILED");
  process.exit(1);
}

console.log("══════════════════════════════════════════════════════════\n");
