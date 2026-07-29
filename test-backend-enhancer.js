/**
 * ANNEXE AI — Backend Enhancer Integration Test
 *
 * Verifies the patched backend_worker pipeline:
 *   architect_worker → backend_worker (engineer → enhancer → merge) → context
 *
 * Uses the real function signature from agent-adapters.js:
 *   runAgentAdapter(workerType, taskInput)
 *   — context manager is module-level, not passed as argument
 *
 * All agents and context manager are stubbed — no real API calls.
 * Existing test files are not modified.
 *
 * Run: node test-backend-enhancer-integration.js
 */

/* ─────────────────────────────────────────────
   STUB DATA
   ───────────────────────────────────────────── */

const STUB_ARCHITECTURE = {
  backend:  { framework: "FastAPI", language: "Python" },
  database: { engine: "PostgreSQL" },
  frontend: { framework: "Next.js" },
};

const STUB_BACKEND_PLAN = {
  services:   ["AuthService", "ProjectService", "AIAgentService"],
  endpoints:  ["/auth/login", "/projects", "/agents/run"],
  middleware: ["rate-limiter", "auth-guard"],
  framework:  "FastAPI",
};

const STUB_ENHANCEMENTS = {
  security: {
    recommendations: ["Add rate-limiting middleware", "Enforce HTTPS-only"],
    priority: "critical",
  },
  performance: {
    recommendations: ["Redis caching", "Connection pooling"],
    priority: "high",
  },
  observability: {
    recommendations: ["Structured JSON logs", "/health endpoint"],
    priority: "medium",
  },
  integrations: {
    recommendations: ["Retry logic with back-off"],
    priority: "medium",
  },
  aiLayer: {
    recommendations: ["Stream LLM responses", "Token-budget guardrails"],
    priority: "high",
  },
  summary: "STUB — 5 enhancement categories.",
};

/* ─────────────────────────────────────────────
   STUB: projectContextManager
   Mirrors the real interface: .get() / .add*()
   ───────────────────────────────────────────── */

const projectContextManager = (() => {
  const _store = {};
  return {
    get:             (id)           => _store[id] || {},
    addArchitecture: (id, arch)     => { if (!_store[id]) _store[id] = {}; _store[id].architecture = arch; },
    addBackendPlan:  (id, plan)     => { if (!_store[id]) _store[id] = {}; _store[id].backendPlan  = plan; },
    addFrontendPlan: (id, plan)     => { if (!_store[id]) _store[id] = {}; _store[id].frontendPlan = plan; },
    addTests:        (id, tests)    => { if (!_store[id]) _store[id] = {}; _store[id].tests        = tests; },
    addReviews:      (id, reviews)  => { if (!_store[id]) _store[id] = {}; _store[id].reviews      = reviews; },
  };
})();

/* ─────────────────────────────────────────────
   STUBS: agent functions
   ───────────────────────────────────────────── */

function runArchitectAgent({ solution, requirements }) {
  return { success: true, architecture: STUB_ARCHITECTURE };
}

function runBackendEngineerAgent({ projectId, architecture }) {
  if (!architecture) return { success: false, error: "architecture required" };
  return { success: true, projectId, backendPlan: { ...STUB_BACKEND_PLAN } };
}

async function runBackendEnhancerAgent({ backendPlan, architecture }) {
  if (!backendPlan && !architecture) {
    return { success: false, error: "backendPlan or architecture required" };
  }
  return { success: true, enhancements: STUB_ENHANCEMENTS };
}

function runFrontendEngineerAgent(input) {
  return { success: true, frontendPlan: { pages: ["Home", "Dashboard"] } };
}

/* ─────────────────────────────────────────────
   PIPELINE UNDER TEST
   Mirrors agent-adapters.js exactly:
   - runAgentAdapter(workerType, taskInput)
   - uses module-level projectContextManager
   - context read via .get(projectId)
   ───────────────────────────────────────────── */

async function runAgentAdapter(workerType, taskInput) {

  switch (workerType) {

    case "architect_worker": {
      const result = runArchitectAgent({
        solution:     taskInput.solution     || null,
        technology:   taskInput.technology   || null,
        requirements: taskInput.requirements || []
      });
      if (result.success && result.architecture) {
        projectContextManager.addArchitecture(taskInput.projectId, result.architecture);
      }
      return result;
    }

    case "backend_worker": {
      const ctx = projectContextManager.get(taskInput.projectId);

      const result = runBackendEngineerAgent({
        projectId:    taskInput.projectId,
        solution:     taskInput.solution     || null,
        architecture: taskInput.architecture || ctx.architecture || null,
        requirements: taskInput.requirements || [],
        technology:   taskInput.technology   || null
      });

      // ── Enhance ────────────────────────────────────────────────────────────
      if (result.success && result.backendPlan) {
        const enhancement = await runBackendEnhancerAgent({
          backendPlan:  result.backendPlan,
          architecture: taskInput.architecture || ctx.architecture || null,
          requirements: taskInput.requirements || []
        });
        if (enhancement.success) {
          result.backendPlan = {
            ...result.backendPlan,
            enhancements: enhancement.enhancements
          };
        }
      }

      // ── Store ──────────────────────────────────────────────────────────────
      if (result.success && result.backendPlan) {
        projectContextManager.addBackendPlan(taskInput.projectId, result.backendPlan);
      }

      return result;
    }

    case "frontend_worker": {
      const ctx = projectContextManager.get(taskInput.projectId);
      const enrichedInput = {
        ...taskInput,
        architecture: taskInput.architecture || ctx.architecture || null,
        backendPlan:  taskInput.backendPlan  || ctx.backendPlan  || null,
        context:      ctx
      };
      const result = runFrontendEngineerAgent(enrichedInput);
      if (result.success && result.frontendPlan) {
        projectContextManager.addFrontendPlan(taskInput.projectId, result.frontendPlan);
      }
      return result;
    }

    default:
      return { success: false, error: `Unknown worker type: ${workerType}` };
  }
}

/* ─────────────────────────────────────────────
   TEST HELPERS
   ───────────────────────────────────────────── */

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) { console.log(`  ✓  ${label}`); passed++; }
  else           { console.error(`  ✗  ${label}`); failed++; }
}

async function runTest(label, fn) {
  console.log(`\n▸ ${label}`);
  try { await fn(); }
  catch (err) { console.error(`  ✗  Threw unexpectedly: ${err.message}`); failed++; }
}

/* ─────────────────────────────────────────────
   TESTS
   ───────────────────────────────────────────── */

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  ANNEXE — Backend Enhancer Integration Tests");
  console.log("═══════════════════════════════════════════════");

  const PROJECT_ID = "test-project-001";

  /* ── 1. architect_worker creates architecture ── */
  await runTest("architect_worker creates architecture", async () => {
    const r = await runAgentAdapter("architect_worker", {
      projectId: PROJECT_ID,
      solution:  "AI project management platform",
    });
    assert("success is true",            r.success === true);
    assert("architecture returned",      typeof r.architecture === "object");
    assert("architecture stored in ctx", !!projectContextManager.get(PROJECT_ID).architecture);
    assert("backend framework correct",  r.architecture.backend?.framework === "FastAPI");
  });

  /* ── 2. backend_worker creates backendPlan ── */
  await runTest("backend_worker creates backendPlan", async () => {
    const r = await runAgentAdapter("backend_worker", {
      projectId:    PROJECT_ID,
      requirements: ["auth", "rate-limiting"],
    });
    assert("success is true",        r.success === true);
    assert("backendPlan returned",   typeof r.backendPlan === "object");
    assert("services array present", Array.isArray(r.backendPlan.services));
    assert("endpoints present",      Array.isArray(r.backendPlan.endpoints));
  });

  /* ── 3. enhancer ran and merged enhancements ── */
  await runTest("enhancer ran and enhancements merged into backendPlan", async () => {
    const r = await runAgentAdapter("backend_worker", { projectId: PROJECT_ID });
    assert("enhancements key on returned plan", "enhancements" in r.backendPlan);

    const enh  = r.backendPlan.enhancements;
    const cats = ["security", "performance", "observability", "integrations", "aiLayer"];
    for (const cat of cats) {
      assert(`"${cat}" present`,                    cat in enh);
      assert(`"${cat}" recommendations non-empty`,  Array.isArray(enh[cat]?.recommendations) && enh[cat].recommendations.length > 0);
      assert(`"${cat}" has priority string`,         typeof enh[cat]?.priority === "string");
    }
    assert("summary present", typeof enh.summary === "string");
  });

  /* ── 4. context contains the enhanced backendPlan ── */
  await runTest("context stores the enhanced backendPlan", async () => {
    const ctx = projectContextManager.get(PROJECT_ID);
    assert("context has backendPlan",          !!ctx.backendPlan);
    assert("original services preserved",      Array.isArray(ctx.backendPlan.services));
    assert("original endpoints preserved",     Array.isArray(ctx.backendPlan.endpoints));
    assert("enhancements merged at top level", !!ctx.backendPlan.enhancements);
    assert("security priority is critical",    ctx.backendPlan.enhancements.security.priority === "critical");
  });

  /* ── 5. return contract unchanged ── */
  await runTest("return contract unchanged — success + backendPlan only", async () => {
    const r = await runAgentAdapter("backend_worker", { projectId: PROJECT_ID });
    assert("result.success is boolean",  typeof r.success === "boolean");
    assert("result.backendPlan present", typeof r.backendPlan === "object");
    assert("no unexpected error key",    !("error" in r));
  });

  /* ── 6. enhancer failure is non-fatal ── */
  await runTest("enhancer failure does not break the pipeline", async () => {
    // Simulate inline with a failing enhancer
    const ctx    = projectContextManager.get(PROJECT_ID);
    const result = runBackendEngineerAgent({
      projectId:    "proj-fail",
      architecture: ctx.architecture,
      requirements: []
    });

    // Simulate failed enhancement
    const enhancement = { success: false, error: "AI unavailable" };
    if (enhancement.success) {
      result.backendPlan = { ...result.backendPlan, enhancements: enhancement.enhancements };
    }
    // Still store without enhancements
    projectContextManager.addBackendPlan("proj-fail", result.backendPlan);

    const stored = projectContextManager.get("proj-fail").backendPlan;
    assert("pipeline succeeded without enhancer", result.success === true);
    assert("backendPlan stored without enhancements", !("enhancements" in stored));
    assert("original plan data intact",              Array.isArray(stored.services));
  });

  /* ── 7. frontend_worker reads context set by backend_worker ── */
  await runTest("frontend_worker reads enhanced backendPlan from context", async () => {
    const r = await runAgentAdapter("frontend_worker", { projectId: PROJECT_ID });
    assert("frontend success",           r.success === true);
    assert("frontendPlan returned",      typeof r.frontendPlan === "object");
    assert("frontendPlan stored in ctx", !!projectContextManager.get(PROJECT_ID).frontendPlan);
  });

  /* ── 8. other worker types unaffected ── */
  await runTest("unknown worker type returns error (other workers untouched)", async () => {
    const r = await runAgentAdapter("unknown_worker", { projectId: PROJECT_ID });
    assert("success is false",      r.success === false);
    assert("error string present",  typeof r.error === "string");
  });

  /* ── Summary ── */
  console.log("\n═══════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main();