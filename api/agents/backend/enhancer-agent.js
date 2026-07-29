/**
 * ANNEXE AI — Backend Enhancer Agent Adapter
 *
 * Thin wrapper that exposes the enhancer capability
 * as a standard ANNEXE agent function.
 *
 * enhancer.js is NOT modified.
 *
 * Imports use current ANNEXE AI core exports:
 *   getPrompt          ← api/core/prompt-manager.js
 *   selectModel        ← api/core/model-router.js
 *   generateAIResponse ← api/core/ai-client.js
 */

import { getPrompt }          from "../../core/prompt-manager.js";
import { selectModel }        from "../../core/model-router.js";
import { generateAIResponse } from "../../core/ai-client.js";

/* ─────────────────────────────────────────────
   MOCK ENHANCEMENTS
   Mirrors the shape produced by enhancer.js.
   Returned when no API key is present or
   mockMode is explicitly requested.
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

/* ─────────────────────────────────────────────
   AGENT FUNCTION
   ───────────────────────────────────────────── */

/**
 * @param {object}  input
 * @param {string}  [input.backendPlan]
 * @param {object}  [input.architecture]
 * @param {Array}   [input.requirements]
 * @param {boolean} [input.mockMode]
 *
 * @returns {Promise<
 *   { success: true,  enhancements: object } |
 *   { success: false, error: string }
 * >}
 */
export async function runBackendEnhancerAgent(input = {}) {
  const { backendPlan, architecture, requirements, mockMode } = input;

  /* ── Validate ── */
  if (!backendPlan && !architecture) {
    return {
      success: false,
      error:   "backendPlan or architecture is required",
    };
  }

  /* ── Mock mode ── */
  const useMock =
    mockMode === true ||
    process.env.MOCK_MODE === "true" ||
    !process.env.OPENROUTER_API_KEY;

  if (useMock) {
    return {
      success:      true,
      enhancements: MOCK_ENHANCEMENTS,
    };
  }

  /* ── Live path ── */
  try {
    const prompt = getPrompt("backend-enhancer", {
      backendPlan:  backendPlan  || "Not provided",
      architecture: architecture || "Not provided",
      requirements: requirements || [],
    });

    const model = selectModel({ task: "backend-enhancement", budget: "standard" });

    const raw = await generateAIResponse({ prompt, model, maxTokens: 1200 });

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
