// ── ANNEXE AI — Technology Intelligence Agent ─────────────────────────────────
//
// File location in project:  api/agents/technology/intelligence.js
//
// NOTE: This file must live at api/agents/technology/intelligence.js
// It is separate from api/agents/product/intelligence.js (the Product Intelligence Agent).
// Both are named intelligence.js but reside in different subdirectories.
//
// ─────────────────────────────────────────────────────────────────────────────

export function runTechnologyAgent({ industry, solution, requirements } = {}) {

  return {

    success: true,

    agent: "technology_intelligence_agent",

    recommendation: {

      frontend: {
        technology: "Next.js",
        reason: "Modern production framework with strong ecosystem, SEO support and scalable architecture"
      },

      backend: {
        technology: "FastAPI",
        reason: "High-performance Python backend suitable for AI integrations and API-driven systems"
      },

      database: {
        technology: "PostgreSQL",
        reason: "Reliable relational database suitable for enterprise applications"
      },

      aiLayer: {
        technology: "LLM API with agent orchestration layer",
        reason: "Flexible AI integration with future model upgrades"
      },

      deployment: {
        technology: "Cloud deployment with CI/CD",
        reason: "Supports scalable production delivery and automated updates"
      },

      evaluation: {
        industry:     industry     || "Unknown",
        solution:     solution     || "Unknown",
        requirements: requirements || [],
        principle:    "Latest stable technology selected based on reliability, security and maintainability"
      }

    }

  };

}


export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { industry, solution, requirements } = req.body || {};

    if (!solution) {
      return res.status(400).json({ error: "Solution requirement missing" });
    }

    const result = runTechnologyAgent({ industry, solution, requirements });

    return res.status(200).json(result);

  } catch (error) {

    console.error("TECHNOLOGY AGENT ERROR:", error);

    return res.status(500).json({ error: "Technology intelligence failed" });

  }

}
