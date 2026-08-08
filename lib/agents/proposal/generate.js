// ── ANNEXE AI — Proposal Intelligence Agent ───────────────────────────────────
//
// Converts internal pipeline outputs (requirements, product decision,
// estimation, technology) into a structured client-facing proposal.
//
// Fully deterministic — no LLM calls, no database, no external APIs.
// All text templates are grouped at the top for easy editing.
//
// Pipeline position:
//   Requirement Agent → Product Intelligence → Estimation → [THIS] → Payment Gate
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Inlined: createProposal (replaces ../../proposal/schema.js) ──────────────
function createProposal(data = {}) {
  return {
    proposalId:           "PROP-" + Date.now(),
    projectId:            data.projectId            || null,
    client:               data.client               || {},
    title:                data.title                || null,
    summary:              data.summary              || null,
    problemStatement:     data.problemStatement     || null,
    recommendedSolution:  data.recommendedSolution  || null,
    approach:             data.approach             || [],
    reusedModules:        data.reusedModules        || [],
    newDevelopment:       data.newDevelopment       || [],
    technologyOverview:   data.technologyOverview   || null,
    timeline:             data.timeline             || null,
    investment:           data.investment           || 0,
    currency:             data.currency             || "USD",
    milestones:           data.milestones           || [],
    paymentTerms:         data.paymentTerms         || [],
    assumptions:          data.assumptions          || [],
    validityDays:         data.validityDays         || 30,
    status:               data.status               || "draft",
    createdAt:            new Date().toISOString()
  };
}


// ── Title templates per project type ─────────────────────────────────────────

const PROJECT_TYPE_TITLES = {
  saas:       "AI-Powered SaaS Platform",
  mobile:     "AI Mobile Application",
  ecommerce:  "AI E-Commerce Platform",
  crm:        "AI CRM Transformation Platform",
  automation: "AI Workflow Automation System",
  dashboard:  "AI Business Intelligence Dashboard",
  api:        "AI API & Integration Layer",
  ai:         "AI Intelligence & Automation Platform",
  fintech:    "AI FinTech Platform",
  custom:     "AI Business Transformation Solution"
};


// ── Solution text per decision type ──────────────────────────────────────────

const SOLUTION_TEXT = {
  reuse: (modules = []) => {
    const list = modules.length
      ? modules.slice(0, 3).join(", ")
      : "existing modules";
    return `Deploy and configure the ANNEXE existing platform, leveraging proven modules (${list}) to deliver your solution rapidly with minimal development overhead.`;
  },

  customize: (modules = [], newDev = []) => {
    const existing = modules.length
      ? modules.slice(0, 3).join(", ")
      : "core modules";
    const additions = newDev.length
      ? newDev.slice(0, 3).join(", ")
      : "custom workflows";
    return `Extend the ANNEXE platform by reusing proven infrastructure (${existing}) and adding new development for your specific requirements (${additions}).`;
  },

  build: (newDev = []) => {
    const scope = newDev.length
      ? newDev.slice(0, 4).join(", ")
      : "a full custom system";
    return `Develop a new bespoke software solution purpose-built for your business: ${scope}. Built on ANNEXE's proven architecture patterns and AI stack.`;
  }
};


// ── Milestone generator ───────────────────────────────────────────────────────

function buildMilestones(estimatedWeeks = 8, decisionType = "build") {

  const total = Math.max(estimatedWeeks, 2);

  // Phase proportions differ by decision type
  const proportions = decisionType === "reuse"
    ? [0.15, 0.20, 0.35, 0.20, 0.10]   // lighter setup + fast deploy
    : decisionType === "customize"
    ? [0.10, 0.20, 0.40, 0.20, 0.10]   // standard
    : [0.10, 0.15, 0.45, 0.20, 0.10];  // full build — more dev time

  const phases = [
    { phase: "Discovery & Requirements",  deliverable: "Confirmed project scope and architecture plan" },
    { phase: "Architecture & Setup",      deliverable: "Technical foundation, environments, and integrations configured" },
    { phase: "Development",               deliverable: "Core platform and AI agent pipeline built and tested internally" },
    { phase: "QA & Testing",              deliverable: "Full test suite passed, performance baselines confirmed" },
    { phase: "Deployment & Handover",     deliverable: "Live deployment, client training, and documentation delivered" }
  ];

  let weekCursor = 0;

  return phases.map((p, i) => {
    const duration = Math.max(1, Math.round(total * proportions[i]));
    weekCursor += duration;
    return {
      phase:       p.phase,
      deliverable: p.deliverable,
      week:        Math.min(weekCursor, total)
    };
  });

}


// ── Payment terms builder ─────────────────────────────────────────────────────
//
// Placeholder terms for Payment Gate Agent (Phase 2.5).
// Percentages always sum to 100.

function buildPaymentTerms(decisionType = "build") {

  if (decisionType === "reuse") {
    return [
      { stage: "Project Start",  percentage: 50, condition: "Deployment begins after 50% advance payment" },
      { stage: "Go-Live",        percentage: 50, condition: "Final payment on successful deployment" }
    ];
  }

  if (decisionType === "customize") {
    return [
      { stage: "Project Start",  percentage: 30, condition: "Development begins after advance payment" },
      { stage: "Development Complete", percentage: 40, condition: "Core platform delivered and approved" },
      { stage: "Go-Live",        percentage: 30, condition: "Final payment on successful deployment" }
    ];
  }

  // build
  return [
    { stage: "Project Start",         percentage: 25, condition: "Development begins after advance payment" },
    { stage: "Architecture Approved", percentage: 25, condition: "Architecture and tech stack signed off" },
    { stage: "Development Complete",  percentage: 30, condition: "Core build delivered and client-tested" },
    { stage: "Go-Live",               percentage: 20, condition: "Final payment on successful deployment" }
  ];

}


// ── Technology overview builder ───────────────────────────────────────────────

function buildTechOverview(technology = {}) {

  const rec = technology?.recommendation || technology || {};

  const lines = [];

  if (rec.frontend?.technology)  lines.push(`Frontend: ${rec.frontend.technology}`);
  if (rec.backend?.technology)   lines.push(`Backend: ${rec.backend.technology}`);
  if (rec.database?.technology)  lines.push(`Database: ${rec.database.technology}`);
  if (rec.aiLayer?.technology)   lines.push(`AI Layer: ${rec.aiLayer.technology}`);
  if (rec.deployment?.technology) lines.push(`Deployment: ${rec.deployment.technology}`);

  return lines.length
    ? lines.join(" · ")
    : "Modern cloud-native stack with AI agent orchestration layer";

}


// ── Summary builder ───────────────────────────────────────────────────────────

function buildSummary({ problem, decisionType, estimatedWeeks, estimatedCost, currency }) {

  const action = {
    reuse:     "deploy a proven AI platform",
    customize: "extend an existing AI platform with custom capabilities",
    build:     "develop a bespoke AI-powered system"
  }[decisionType] || "deliver an AI transformation";

  const costStr = estimatedCost
    ? `$${estimatedCost.toLocaleString()} ${currency}`
    : "to be confirmed";

  const weekStr = estimatedWeeks
    ? `${estimatedWeeks} week${estimatedWeeks !== 1 ? "s" : ""}`
    : "a defined timeline";

  return `ANNEXE proposes to ${action} that addresses the following challenge: ${problem || "the identified operational requirements"}. The engagement is estimated at ${costStr} over ${weekStr}, delivering a production-ready AI solution aligned with your business objectives.`;

}


// ── Assumptions builder ───────────────────────────────────────────────────────

function buildAssumptions(decisionType, estimatedWeeks, features = []) {

  const list = [
    "Proposal is valid for 30 days from issue date.",
    "Timeline assumes timely client feedback at each milestone gate.",
    "Scope changes after architecture approval may affect timeline and cost.",
    "Third-party API access and credentials will be provided by the client.",
    "Estimates exclude third-party SaaS licensing fees."
  ];

  if (decisionType === "reuse") {
    list.push("Reuse decision assumes no significant deviation from the existing module interface.");
  }

  if (decisionType === "build" && features.length > 5) {
    list.push("Large feature scope — phased delivery approach recommended to manage risk.");
  }

  if (estimatedWeeks >= 12) {
    list.push("Engagements over 12 weeks include a mid-project scope review checkpoint.");
  }

  return list;

}


// ── Title resolver ────────────────────────────────────────────────────────────

function resolveTitle(requirements = {}) {

  const projectType = requirements?.projectType?.toLowerCase() || "";
  const industry    = requirements?.client?.industry || "";

  const base = PROJECT_TYPE_TITLES[projectType]
    || PROJECT_TYPE_TITLES[industry]
    || PROJECT_TYPE_TITLES.custom;

  // Prepend industry if known and not already in base title
  if (industry && !base.toLowerCase().includes(industry.toLowerCase())) {
    return `${industry} ${base}`;
  }

  return base;

}


// ── Main exported agent function ──────────────────────────────────────────────

/**
 * runProposalAgent
 *
 * @param {object} input
 * @param {object} input.requirements   - Output from runRequirementAgent().requirements
 * @param {object} input.productDecision - Output from runProductIntelligenceAgent()
 * @param {object} input.estimation     - Output from runEstimationAgent().estimation
 * @param {object} [input.technology]   - Output from runTechnologyAgent()
 * @param {string} [input.projectId]    - Parent project ID (optional)
 *
 * @returns {object} { success, agent, proposal }
 */
export function runProposalAgent({
  requirements    = {},
  productDecision = {},
  estimation      = {},
  technology      = {},
  projectId       = null
} = {}) {

  const decisionType    = productDecision?.decision     || "build";
  const reusedModules   = productDecision?.reusableModules || [];
  const newDevelopment  = productDecision?.newDevelopment  || [];
  const estimatedWeeks  = estimation?.estimatedWeeks    || 0;
  const estimatedCost   = estimation?.estimatedCost     || 0;
  const currency        = estimation?.currency          || "USD";
  const features        = requirements?.features        || [];
  const problem         = requirements?.problem         || "Identified operational challenge";

  // ── Resolve all proposal fields ───────────────────────────────────────────

  const title = resolveTitle(requirements);

  const summary = buildSummary({
    problem,
    decisionType,
    estimatedWeeks,
    estimatedCost,
    currency
  });

  const recommendedSolution = decisionType === "reuse"
    ? SOLUTION_TEXT.reuse(reusedModules)
    : decisionType === "customize"
    ? SOLUTION_TEXT.customize(reusedModules, newDevelopment)
    : SOLUTION_TEXT.build(newDevelopment);

  const technologyOverview = buildTechOverview(technology);

  const timeline   = estimatedWeeks
    ? `${estimatedWeeks} week${estimatedWeeks !== 1 ? "s" : ""}`
    : null;

  const milestones    = buildMilestones(estimatedWeeks, decisionType);
  const paymentTerms  = buildPaymentTerms(decisionType);
  const assumptions   = buildAssumptions(decisionType, estimatedWeeks, features);

  // ── Assemble proposal ─────────────────────────────────────────────────────

  const proposal = createProposal({
    projectId,

    client: requirements?.client || {},

    title,
    summary,

    problemStatement:    problem,
    recommendedSolution,

    approach: [
      "Discovery",
      "Architecture",
      "Development",
      "Testing",
      "Deployment"
    ],

    reusedModules,
    newDevelopment,

    technologyOverview,

    timeline,
    investment: estimatedCost,
    currency,

    milestones,
    paymentTerms,
    assumptions,

    validityDays: 30,
    status:       "draft"
  });


  return {
    success: true,
    agent:   "proposal_agent",
    version: "1.0.0",

    proposal,

    _meta: {
      decisionType,
      milestonesGenerated:  milestones.length,
      paymentTermsCount:    paymentTerms.length,
      assumptionsCount:     assumptions.length,
      generatedAt:          new Date().toISOString()
    }
  };

}


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      requirements,
      productDecision,
      estimation,
      technology,
      projectId
    } = req.body || {};

    if (!productDecision && !estimation) {
      return res.status(400).json({ error: "productDecision and estimation are required" });
    }

    const result = runProposalAgent({
      requirements,
      productDecision,
      estimation,
      technology,
      projectId
    });

    return res.status(200).json(result);

  } catch (error) {

    console.error("PROPOSAL AGENT ERROR:", error);

    return res.status(500).json({ error: "Proposal generation failed" });

  }

}
