/**
 * ANNEXE AI — Backend Enhancer Agent
 *
 * Enhances a backend plan with additional architectural
 * recommendations, security hardening, performance
 * optimizations, and integration patterns.
 *
 * Does NOT modify the existing backend engineer.
 * Acts as an additive layer on top of its output.
 *
 * Input:  { backendPlan, architecture, requirements }
 * Output: { success, enhancements }
 */

import { buildPrompt }   from "../../shared/prompt-manager.js";
import { routeModel }    from "../../shared/model-router.js";
import { callAI }        from "../../shared/ai-client.js";

/* ─────────────────────────────────────────────
   MOCK DATA
   Returned when MOCK_MODE=true or no real API key
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
   PROMPT BUILDER
   ───────────────────────────────────────────── */

function buildEnhancerPrompt({ backendPlan, architecture, requirements }) {
  return buildPrompt({
    role: "ANNEXE Backend Enhancer Agent",
    task: `
You are an elite backend architect. 
Review the provided backend plan and architecture then produce a structured 
set of enhancements across five categories:
  1. security
  2. performance
  3. observability
  4. integrations
  5. aiLayer

For each category return:
  - recommendations: string[]  (concrete, actionable items)
  - priority: "critical" | "high" | "medium" | "low"

Also return a one-sentence "summary" of the overall enhancement pass.

Respond ONLY with valid JSON matching this shape:
{
  "security":      { "recommendations": [], "priority": "" },
  "performance":   { "recommendations": [], "priority": "" },
  "observability": { "recommendations": [], "priority": "" },
  "integrations":  { "recommendations": [], "priority": "" },
  "aiLayer":       { "recommendations": [], "priority": "" },
  "summary": ""
}
    `.trim(),
    context: {
      backendPlan:  backendPlan  || "Not provided",
      architecture: architecture || "Not provided",
      requirements: requirements || [],
    },
  });
}

/* ─────────────────────────────────────────────
   CORE HANDLER
   ───────────────────────────────────────────── */

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      backendPlan,
      architecture,
      requirements,
      mockMode,          // caller can force mock via body flag
    } = req.body || {};

    if (!backendPlan && !architecture) {
      return res.status(400).json({
        error: "backendPlan or architecture is required",
      });
    }

    /* ── Resolve mock mode ── */
    const useMock =
      mockMode === true ||
      process.env.MOCK_MODE === "true" ||
      !process.env.OPENROUTER_API_KEY;

    if (useMock) {
      return res.status(200).json({
        success:      true,
        mockMode:     true,
        enhancements: MOCK_ENHANCEMENTS,
      });
    }

    /* ── Build prompt ── */
    const prompt = buildEnhancerPrompt({
      backendPlan,
      architecture,
      requirements,
    });

    /* ── Route to appropriate model ── */
    const model = routeModel({
      task:   "backend-enhancement",
      budget: "standard",
    });

    /* ── Call AI ── */
    const raw = await callAI({ prompt, model, maxTokens: 1200 });

    /* ── Parse JSON from AI response ── */
    let enhancements;
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      enhancements  = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return raw text under a generic key
      enhancements = { raw, summary: "Could not parse structured output." };
    }

    return res.status(200).json({
      success:      true,
      mockMode:     false,
      enhancements,
    });

  } catch (error) {
    console.error("BACKEND ENHANCER ERROR:", error);
    return res.status(500).json({ error: "Backend enhancement failed" });
  }
}
