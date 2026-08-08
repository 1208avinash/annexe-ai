// ── ANNEXE AI — Product Intelligence Agent ────────────────────────────────────
//
// Compares incoming project requirements against the ANNEXE Product Vault
// and returns a build/customize/reuse decision with full match analysis.
//
// Decision thresholds:
//   >= 80%  →  reuse      (existing product covers requirements well)
//   >= 40%  →  customize  (existing product needs extension)
//    < 40%  →  build      (no suitable product found)
//
// No AI API calls — deterministic scoring only.
// Phase 3: replace scoring with LLM-assisted semantic matching.
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Inlined: createProduct + PRODUCT_LIBRARY (replaces ../../products/library.js + schema.js) ──
function createProduct(data = {}) {
  return {
    productId:   data.productId   || "PROD-" + Date.now(),
    name:        data.name        || null,
    description: data.description || null,
    category:    data.category    || null,
    modules:     data.modules     || [],
    features:    data.features    || [],
    technology: {
      frontend:   data.technology?.frontend   || null,
      backend:    data.technology?.backend    || null,
      database:   data.technology?.database   || null,
      aiLayer:    data.technology?.aiLayer    || null,
      deployment: data.technology?.deployment || null
    },
    repository: data.repository || null,
    version:    data.version    || "1.0.0",
    status:     data.status     || "development",
    createdAt:  data.createdAt  || new Date().toISOString()
  };
}

const PRODUCT_LIBRARY = [

  createProduct({
    productId:   "PROD-001",
    name:        "ANNEXE AI CRM Platform",
    description: "Full-stack AI-powered CRM with lead management, pipeline tracking, and business intelligence.",
    category:    "crm",
    modules:  [ "authentication", "dashboard", "crm", "reports", "notifications", "api / integrations" ],
    features: [ "authentication", "dashboard", "crm / contacts", "reporting", "notifications", "api / integrations", "chat / messaging" ],
    technology: { frontend: "Next.js", backend: "FastAPI", database: "PostgreSQL", aiLayer: "LLM API with agent orchestration layer", deployment: "Cloud deployment with CI/CD" },
    repository: "placeholder/annexe-crm",
    version:    "1.0.0",
    status:     "stable"
  }),

  createProduct({
    productId:   "PROD-002",
    name:        "ANNEXE AI Trading Platform",
    description: "Algorithmic trading platform with real-time market data, automated execution, and portfolio analytics.",
    category:    "fintech",
    modules:  [ "authentication", "trading-engine", "dashboard", "analytics", "notifications", "api / integrations" ],
    features: [ "authentication", "dashboard", "reporting", "notifications", "api / integrations", "payments", "file management" ],
    technology: { frontend: "Next.js", backend: "FastAPI", database: "PostgreSQL", aiLayer: "LLM API with agent orchestration layer", deployment: "Cloud deployment with CI/CD" },
    repository: "placeholder/annexe-trading",
    version:    "1.0.0",
    status:     "development"
  })

];


// ── Match scorer ──────────────────────────────────────────────────────────────
//
// Scores a single product against requirement features.
// Combines module-level and feature-level matches with equal weight.

function scoreProduct(product, requirement) {

  const reqFeatures = [
    ...(requirement?.features || []),
    ...(requirement?.modules  || [])
  ].map(f => f.toLowerCase());

  if (!reqFeatures.length) return 0;

  const productCapabilities = [
    ...(product.features || []),
    ...(product.modules  || [])
  ].map(c => c.toLowerCase());

  const matched = reqFeatures.filter(f =>
    productCapabilities.some(c => c.includes(f) || f.includes(c))
  );

  return matched.length / reqFeatures.length;

}


// ── Main exported agent function ──────────────────────────────────────────────

/**
 * runProductIntelligenceAgent
 *
 * @param {object} input
 * @param {object} input.requirements - Output from runRequirementAgent().requirements
 *
 * @returns {object} Product intelligence decision
 */
export function runProductIntelligenceAgent({ requirements = {} } = {}) {

  // ── Score every product in the vault ─────────────────────────────────────

  const scored = PRODUCT_LIBRARY
    .map(product => ({
      product,
      rawScore: scoreProduct(product, requirements)
    }))
    .filter(entry => entry.rawScore > 0)
    .sort((a, b) => b.rawScore - a.rawScore);


  // ── Resolve decision ──────────────────────────────────────────────────────

  const bestMatch  = scored[0] || null;
  const matchScore = bestMatch ? Math.round(bestMatch.rawScore * 100) : 0;

  let decision        = "build";
  let matchedProducts = [];
  let reusableModules = [];
  let newDevelopment  = requirements?.features || [];

  if (bestMatch) {

    matchedProducts = scored.map(s => ({
      productId:  s.product.productId,
      name:       s.product.name,
      category:   s.product.category,
      matchScore: Math.round(s.rawScore * 100)
    }));

    if (matchScore >= 80) {

      decision        = "reuse";
      reusableModules = bestMatch.product.modules || [];
      newDevelopment  = [];

    } else if (matchScore >= 40) {

      decision        = "customize";
      reusableModules = bestMatch.product.modules || [];

      // Features required but not present in the best-matched product
      const productCapabilities = [
        ...(bestMatch.product.features || []),
        ...(bestMatch.product.modules  || [])
      ].map(c => c.toLowerCase());

      newDevelopment = (requirements?.features || []).filter(f =>
        !productCapabilities.some(c => c.includes(f.toLowerCase()) || f.toLowerCase().includes(c))
      );

    }

  }


  // ── Reasoning ─────────────────────────────────────────────────────────────

  const reasoning =
    decision === "reuse"
      ? `'${bestMatch.product.name}' covers ${matchScore}% of requirements. Full reuse recommended.`
    : decision === "customize"
      ? `'${bestMatch.product.name}' covers ${matchScore}% of requirements. Customization + ${newDevelopment.length} new module(s) required.`
    : "No suitable product found in the ANNEXE Vault. Full build required.";


  return {
    success: true,
    agent:   "product_intelligence_agent",
    version: "2.0.0",

    decision,
    matchScore,

    matchedProducts,
    reusableModules,
    newDevelopment,

    reasoning,

    _meta: {
      vaultSize:       PRODUCT_LIBRARY.length,
      candidatesFound: scored.length,
      evaluatedAt:     new Date().toISOString()
    }
  };

}


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { requirements } = req.body || {};

    if (!requirements) {
      return res.status(400).json({ error: "Requirements object required" });
    }

    const result = runProductIntelligenceAgent({ requirements });

    return res.status(200).json(result);

  } catch (error) {

    console.error("PRODUCT INTELLIGENCE AGENT ERROR:", error);

    return res.status(500).json({ error: "Product intelligence failed" });

  }

}
