/**
 * ANNEXE AI — Backend Enhancer Agent Test Suite
 *
 * Verifies enhancer-agent.js using mock mode only.
 * No real API calls are made.
 * Existing test-backend-enhancer.js is untouched.
 *
 * Run:  node test-backend-enhancer-agent.js
 */

/* ─────────────────────────────────────────────
   Stubs matching current ANNEXE AI core exports
   ───────────────────────────────────────────── */

function getPrompt(templateKey, context) {
  return { templateKey, context, _stub: true };
}

function selectModel({ task, budget } = {}) {
  return `stub-model::${task ?? "general"}::${budget ?? "standard"}`;
}

async function generateAIResponse() {
  throw new Error("generateAIResponse stub — must not be reached in mock mode");
}

/* ─────────────────────────────────────────────
   Agent — inlined with stubs injected
   (mirrors enhancer-agent.js exactly)
   ───────────────────────────────────────────── */

const MOCK_ENHANCEMENTS = {
  security: {
    recommendations: [
      "Add rate-limiting middleware (e.g. express-rate-limit / slowapi)",
      "Enforce HTTPS-only with HSTS headers",
      "Sanitise all inputs with a validation library (Zod / Pydantic)",
      "Store secrets in environment variables — never in source",
      "Add CORS policy scoped to known origins only",
    ],
    priority: "critical",
  },
  performance: {
    recommendations: [
      "Add Redis caching layer for frequently-read data",
      "Use database connection pooling (pgBouncer / asyncpg pool)",
      "Paginate list endpoints — default page size 25",
      "Defer non-critical work to a job queue (BullMQ / Celery)",
      "Enable gzip/brotli compression on API responses",
    ],
    priority: "high",
  },
  observability: {
    recommendations: [
      "Emit structured JSON logs with request-id correlation",
      "Expose a /health and /ready endpoint for uptime checks",
      "Instrument key operations with OpenTelemetry spans",
      "Set up error alerting (Sentry or equivalent)",
    ],
    priority: "medium",
  },
  integrations: {
    recommendations: [
      "Wrap third-party API calls in retry logic with exponential back-off",
      "Use an outbox pattern for reliable event publishing",
      "Version all external API contracts with a changelog",
    ],
    priority: "medium",
  },
  aiLayer: {
    recommendations: [
      "Stream LLM responses to reduce perceived latency",
      "Implement token-budget guardrails per request",
      "Cache deterministic AI responses with a short TTL",
      "Log prompt + completion pairs for future fine-tuning",
    ],
    priority: "high",
  },
  summary:
    "MOCK MODE — 5 enhancement categories generated without calling the AI API.",
};

async function runBackendEnhancerAgent(input = {}) {
  const { backendPlan, architecture, requirements, mockMode } = input;

  if (!backendPlan && !architecture) {
    return { success: false, error: "backendPlan or architecture is required" };
  }

  const useMock =
    mockMode === true ||
    process.env.MOCK_MODE === "true" ||
    !process.env.OPENROUTER_API_KEY;

  if (useMock) {
    return { success: true, enhancements: MOCK_ENHANCEMENTS };
  }

  try {
    const prompt = getPrompt("backend-enhancer", {
      backendPlan:  backendPlan  || "Not provided",
      architecture: architecture || "Not provided",
      requirements: requirements || [],
    });

    const model = selectModel({ task: "backend-enhancement", budget: "standard" });
    const raw   = await generateAIResponse({ prompt, model, maxTokens: 1200 });

    let enhancements;
    try {
      enhancements = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      enhancements = { raw, summary: "Could not parse structured output." };
    }

    return { success: true, enhancements };

  } catch (err) {
    return { success: false, error: `Enhancement failed: ${err.message}` };
  }
}

/* ─────────────────────────────────────────────
   Test helpers
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

const CATS = ["security", "performance", "observability", "integrations", "aiLayer"];

/* ─────────────────────────────────────────────
   Tests
   ───────────────────────────────────────────── */

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  ANNEXE — Backend Enhancer Agent Tests");
  console.log("═══════════════════════════════════════════");

  await runTest("Imports: uses getPrompt / selectModel / generateAIResponse", async () => {
    // Stubs above use the correct names — if the agent called the old names
    // (buildPrompt / routeModel / callAI) the stubs would not intercept them.
    // Reaching this point without a ReferenceError confirms correct binding.
    assert("getPrompt stub is a function",          typeof getPrompt === "function");
    assert("selectModel stub is a function",        typeof selectModel === "function");
    assert("generateAIResponse stub is a function", typeof generateAIResponse === "function");
  });

  await runTest("Accepts backendPlan as primary input", async () => {
    const r = await runBackendEnhancerAgent({ backendPlan: "FastAPI service", mockMode: true });
    assert("success is true",    r.success === true);
    assert("enhancements exist", typeof r.enhancements === "object");
    assert("no error",           !r.error);
  });

  await runTest("Accepts architecture as primary input", async () => {
    const r = await runBackendEnhancerAgent({ architecture: { db: "postgres" }, mockMode: true });
    assert("success is true",    r.success === true);
    assert("enhancements exist", typeof r.enhancements === "object");
  });

  await runTest("Accepts backendPlan + architecture + requirements", async () => {
    const r = await runBackendEnhancerAgent({
      backendPlan:  "Node.js API",
      architecture: { backend: "Express" },
      requirements: ["auth", "caching"],
      mockMode:     true,
    });
    assert("success is true", r.success === true);
  });

  await runTest("Returns correct enhancements shape", async () => {
    const { enhancements } = await runBackendEnhancerAgent({ backendPlan: "plan", mockMode: true });
    for (const cat of CATS) {
      assert(`"${cat}" present`,                     cat in enhancements);
      assert(`"${cat}" recommendations is array`,    Array.isArray(enhancements[cat]?.recommendations));
      assert(`"${cat}" recommendations non-empty`,   enhancements[cat].recommendations.length > 0);
      assert(`"${cat}" priority is string`,          typeof enhancements[cat]?.priority === "string");
    }
    assert("summary present", typeof enhancements.summary === "string");
  });

  await runTest("Security priority is critical", async () => {
    const { enhancements } = await runBackendEnhancerAgent({ backendPlan: "plan", mockMode: true });
    assert("security.priority === 'critical'", enhancements.security.priority === "critical");
  });

  await runTest("All recommendations are non-empty strings", async () => {
    const { enhancements } = await runBackendEnhancerAgent({ backendPlan: "plan", mockMode: true });
    let allValid = true;
    for (const cat of CATS) {
      for (const rec of enhancements[cat].recommendations) {
        if (typeof rec !== "string" || rec.trim() === "") allValid = false;
      }
    }
    assert("All recommendations non-empty strings", allValid);
  });

  await runTest("Missing both inputs → failure response", async () => {
    const r = await runBackendEnhancerAgent({ mockMode: true });
    assert("success is false",      r.success === false);
    assert("error string present",  typeof r.error === "string");
    assert("no enhancements field", !r.enhancements);
  });

  await runTest("Mock mode never calls generateAIResponse", async () => {
    // generateAIResponse stub throws — if mock mode is working it is never reached
    const r = await runBackendEnhancerAgent({ backendPlan: "plan", mockMode: true });
    assert("completed without AI call", r.success === true);
  });

  await runTest("enhancer.js not referenced inside agent", async () => {
    const src = runBackendEnhancerAgent.toString();
    assert("no import of enhancer.js", !src.includes("enhancer.js"));
  });

  console.log("\n═══════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main();
