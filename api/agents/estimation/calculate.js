// ── ANNEXE AI — Estimation Intelligence Agent ─────────────────────────────────
//
// Converts a product decision + requirements + technology stack into a
// structured cost, timeline, and complexity estimate.
//
// Fully deterministic — no LLM calls, no database, no external APIs.
// All constants are grouped at the top for easy tuning.
//
// Decision flow:
//   1. Score raw complexity from features, integrations, and AI surface area
//   2. Apply decision multiplier (reuse / customize / build)
//   3. Map effective score to complexity band
//   4. Derive timeline and cost from band + multiplier
//   5. Resolve required agents from complexity and risk
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Inlined: createEstimation (replaces ../../estimation/schema.js) ──────────
function createEstimation(data = {}) {
  return {
    estimationId:      "EST-" + Date.now(),
    projectId:         data.projectId         || null,
    decisionType:      data.decisionType      || "build",
    complexity:        data.complexity        || "medium",
    complexityScore:   data.complexityScore   || 0,
    estimatedWeeks:    data.estimatedWeeks    || 0,
    estimatedCost:     data.estimatedCost     || 0,
    currency:          data.currency          || "USD",
    requiredAgents:    data.requiredAgents    || [],
    riskScore:         data.riskScore         || 0,
    confidenceScore:   data.confidenceScore   || 0,
    assumptions:       data.assumptions       || [],
    createdAt:         new Date().toISOString()
  };
}


// ── Tunable constants ─────────────────────────────────────────────────────────

const BASE_WEEKLY_RATE = 1000;   // USD per effective week

// Complexity band thresholds (raw score before multiplier)
const BAND = {
  LOW_MAX:    30,
  MEDIUM_MAX: 70
  // anything above MEDIUM_MAX → "high"
};

// How many base weeks each complexity band maps to
const BAND_WEEKS = {
  low:    3,     // 2–4 week midpoint
  medium: 8,     // 5–12 week midpoint
  high:   16     // 12+ week representative value
};

// Decision multipliers (applied to both score and cost)
const DECISION_MULTIPLIER = {
  reuse:     0.4,
  customize: 0.7,
  build:     1.0
};

// Points awarded per feature category keyword match
const FEATURE_POINTS = {
  // AI / intelligence surface
  "ai":            8,
  "ai engine":     8,
  "agent":         6,
  "intelligence":  5,
  "automation":    5,
  "chatbot":       4,

  // Security / compliance
  "security":      6,
  "auth":          4,
  "authentication":4,
  "compliance":    5,
  "encryption":    4,

  // Payments / billing
  "payment":       5,
  "payments":      5,
  "billing":       4,
  "invoice":       3,
  "subscription":  4,

  // Data / analytics
  "analytics":     4,
  "reporting":     3,
  "dashboard":     3,
  "metrics":       3,
  "kpi":           2,

  // Integration / API
  "api / integrations": 4,
  "integration":   4,
  "webhook":       3,
  "sync":          2,

  // CRM / ops
  "crm":           3,
  "crm / contacts":3,
  "pipeline":      3,
  "workflow":      4,
  "notifications": 2,

  // General
  "chat / messaging": 3,
  "file management":  2,
  "file":          2,
  "upload":        2
};

// Default points for any feature not in the map above
const DEFAULT_FEATURE_POINTS = 2;

// Risk thresholds
const RISK_THRESHOLD = {
  HIGH_COMPLEXITY_SCORE: 50,   // raw score above this → elevated risk flag
  HIGH_RISK_CUTOFF:      70    // riskScore above this → adds security_agent
};


// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * scoreFeature
 * Returns complexity points for a single feature string.
 */
function scoreFeature(feature = "") {
  const norm = feature.toLowerCase().trim();

  // Exact key match first
  if (FEATURE_POINTS[norm] !== undefined) return FEATURE_POINTS[norm];

  // Partial keyword match
  for (const [key, pts] of Object.entries(FEATURE_POINTS)) {
    if (norm.includes(key) || key.includes(norm)) return pts;
  }

  return DEFAULT_FEATURE_POINTS;
}

/**
 * resolveComplexityBand
 * Maps a raw complexity score to a named band.
 */
function resolveComplexityBand(rawScore) {
  if (rawScore <= BAND.LOW_MAX)    return "low";
  if (rawScore <= BAND.MEDIUM_MAX) return "medium";
  return "high";
}

/**
 * resolveRequiredAgents
 * Returns the agent list based on complexity and risk.
 */
function resolveRequiredAgents(complexity, riskScore) {
  const agents = ["architect_agent", "developer_agent"];

  if (complexity === "medium" || complexity === "high") {
    agents.push("qa_agent", "testing_agent");
  }

  if (riskScore > RISK_THRESHOLD.HIGH_RISK_CUTOFF) {
    agents.push("security_agent");
  }

  return agents;
}

/**
 * buildAssumptions
 * Generates human-readable assumption statements for the estimation.
 */
function buildAssumptions(decisionType, complexity, features = []) {
  const list = [
    `Decision type '${decisionType}' applies a ${DECISION_MULTIPLIER[decisionType] * 100}% effort multiplier.`,
    `Complexity band '${complexity}' is based on ${features.length} detected feature(s).`,
    `Base weekly rate: $${BASE_WEEKLY_RATE} USD.`,
    "Timeline assumes a single focused development team.",
    "Estimates exclude third-party licensing costs."
  ];

  if (features.length === 0) {
    list.push("No features detected — minimum baseline estimate applied.");
  }

  return list;
}


// ── Main exported agent function ──────────────────────────────────────────────

/**
 * runEstimationAgent
 *
 * @param {object} input
 * @param {object} input.productDecision - Output from runProductIntelligenceAgent()
 * @param {object} input.requirements    - Output from runRequirementAgent().requirements
 * @param {object} [input.technology]    - Output from runTechnologyAgent() (optional)
 * @param {string} [input.projectId]     - Parent project ID (optional)
 *
 * @returns {object} { success, agent, estimation }
 */
export function runEstimationAgent({
  productDecision = {},
  requirements    = {},
  technology      = {},
  projectId       = null
} = {}) {

  // ── 1. Resolve decision type ──────────────────────────────────────────────

  const decisionType = productDecision?.decision || "build";
  const multiplier   = DECISION_MULTIPLIER[decisionType] ?? 1.0;


  // ── 2. Score raw complexity ───────────────────────────────────────────────

  const features = [
    ...(requirements?.features || []),
    ...(requirements?.modules  || [])
  ];

  // Base: one point per feature (minimum floor)
  let rawScore = features.length;

  // Add weighted points per feature
  for (const f of features) {
    rawScore += scoreFeature(f);
  }

  // Bonus: integrations detected
  const hasIntegrations = features.some(f =>
    f.toLowerCase().includes("integrat") ||
    f.toLowerCase().includes("api") ||
    f.toLowerCase().includes("webhook")
  );
  if (hasIntegrations) rawScore += 10;

  // Bonus: AI functionality
  const hasAI = features.some(f =>
    f.toLowerCase().includes("ai") ||
    f.toLowerCase().includes("agent") ||
    f.toLowerCase().includes("automat") ||
    f.toLowerCase().includes("intelligence")
  );
  if (hasAI) rawScore += 15;

  // Bonus: security/auth requirements
  const hasSecurity = features.some(f =>
    f.toLowerCase().includes("security") ||
    f.toLowerCase().includes("auth") ||
    f.toLowerCase().includes("compliance")
  );
  if (hasSecurity) rawScore += 8;

  // Bonus: payment processing
  const hasPayments = features.some(f =>
    f.toLowerCase().includes("payment") ||
    f.toLowerCase().includes("billing") ||
    f.toLowerCase().includes("subscription")
  );
  if (hasPayments) rawScore += 5;


  // ── 3. Apply multiplier → effective score ─────────────────────────────────

  const complexityScore = Math.round(rawScore * multiplier);


  // ── 4. Map to complexity band ─────────────────────────────────────────────

  const complexity = resolveComplexityBand(complexityScore);


  // ── 5. Calculate timeline and cost ───────────────────────────────────────

  const baseWeeks    = BAND_WEEKS[complexity];
  const estimatedWeeks = Math.round(baseWeeks * multiplier + 0.5);  // ceil-ish
  const estimatedCost  = Math.round(estimatedWeeks * BASE_WEEKLY_RATE * multiplier);


  // ── 6. Risk score ─────────────────────────────────────────────────────────
  //
  // Higher raw score = higher uncertainty.
  // Reuse decisions carry lower risk; build decisions carry higher risk.

  const baseRisk  = Math.min(rawScore, 100);
  const riskBonus = decisionType === "build" ? 15 : decisionType === "customize" ? 5 : 0;
  const riskScore = Math.min(Math.round(baseRisk * 0.6 + riskBonus), 100);


  // ── 7. Confidence score ───────────────────────────────────────────────────
  //
  // Based on data quality: how many features were detected, plus
  // whether a product decision was provided.

  let confidenceScore = 40;  // baseline
  if (features.length >= 3)  confidenceScore += 20;
  if (features.length >= 6)  confidenceScore += 15;
  if (productDecision?.decision) confidenceScore += 15;
  if (requirements?.problem)     confidenceScore += 10;
  confidenceScore = Math.min(confidenceScore, 100);


  // ── 8. Required agents ────────────────────────────────────────────────────

  const requiredAgents = resolveRequiredAgents(complexity, riskScore);


  // ── 9. Assumptions ────────────────────────────────────────────────────────

  const assumptions = buildAssumptions(decisionType, complexity, features);


  // ── 10. Assemble estimation record ────────────────────────────────────────

  const estimation = createEstimation({
    projectId,
    decisionType,
    complexity,
    complexityScore,
    estimatedWeeks,
    estimatedCost,
    currency:       "USD",
    requiredAgents,
    riskScore,
    confidenceScore,
    assumptions
  });


  return {
    success: true,
    agent:   "estimation_agent",
    version: "1.0.0",

    estimation,

    _meta: {
      rawScore,
      effectiveScore:   complexityScore,
      multiplierApplied: multiplier,
      featuresScored:   features.length,
      evaluatedAt:      new Date().toISOString()
    }
  };

}


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { productDecision, requirements, technology, projectId } = req.body || {};

    if (!productDecision && !requirements) {
      return res.status(400).json({ error: "productDecision or requirements required" });
    }

    const result = runEstimationAgent({
      productDecision,
      requirements,
      technology,
      projectId
    });

    return res.status(200).json(result);

  } catch (error) {

    console.error("ESTIMATION AGENT ERROR:", error);

    return res.status(500).json({ error: "Estimation failed" });

  }

}
