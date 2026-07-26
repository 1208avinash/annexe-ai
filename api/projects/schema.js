// ── ANNEXE AI — Project Lifecycle Schema ─────────────────────────────────────
//
// Central structure for every ANNEXE project.
// All agents read from and write to this shape.
//
// Framework-independent — no database, no external dependencies.
// Designed for future persistence adapter (Vercel KV, Postgres, Redis).
//
// ─────────────────────────────────────────────────────────────────────────────


/**
 * createProjectSchema
 *
 * Factory function for a new ANNEXE project record.
 * Pass known data via `data`; everything else defaults to safe initial values.
 *
 * @param {object} data - Seed values (all optional)
 * @returns {object}    - Complete project lifecycle object
 */
export function createProjectSchema(data = {}) {

  const now = new Date().toISOString();

  return {

    // ── Identity ──────────────────────────────────────────────────────────────

    projectId:   data.projectId   || "ANNEXE-" + Date.now(),
    status:      data.status      || "analysis",
    currentAgent: data.currentAgent || "requirement_agent",

    createdAt:   data.createdAt   || now,
    updatedAt:   now,


    // ── Client information ────────────────────────────────────────────────────

    client: {
      name:        data.clientName  || data.client?.name        || null,
      companyName: data.companyName || data.client?.companyName || null,
      role:        data.role        || data.client?.role        || null,
      email:       data.email       || data.client?.email       || null,
      industry:    data.industry    || data.client?.industry    || null
    },


    // ── Project classification ────────────────────────────────────────────────

    projectType: data.projectType || null,


    // ── Agent outputs ─────────────────────────────────────────────────────────

    requirements: data.requirements || {
      problem:         null,
      businessGoal:    null,
      users:           [],
      features:        [],
      constraints:     [],
      projectType:     null,
      priority:        null,
      confidenceScore: 0
    },

    productDecision: data.productDecision || {
      decision:        null,   // "build" | "customize" | "reuse"
      matchScore:      0,
      reusableModules: [],
      newDevelopment:  [],
      reasoning:       null
    },

    technology: data.technology || null,

    architecture: data.architecture || null,

    developmentPlan: data.developmentPlan || null,


    // ── Business layer ────────────────────────────────────────────────────────

    estimation: data.estimation || {
      timeline:  null,
      phases:    [],
      breakdown: null
    },

    proposal: data.proposal || {
      generated: false,
      sentAt:    null,
      content:   null
    },


    // ── Payment ───────────────────────────────────────────────────────────────

    payment: data.payment || {
      required:  false,
      status:    "pending",   // "pending" | "paid" | "failed" | "waived"
      amount:    null,
      currency:  null,
      paidAt:    null
    },


    // ── Approvals ─────────────────────────────────────────────────────────────

    approvals: data.approvals || {
      product:      false,   // human approved product decision
      architecture: false,   // human approved architecture
      deployment:   false    // human approved deployment
    },


    // ── Pipeline tracker ──────────────────────────────────────────────────────

    agentPipeline: data.agentPipeline || {
      requirement_agent: "pending",
      product_agent:     "pending",
      technology_agent:  "pending",
      architect_agent:   "pending",
      developer_agent:   "pending",
      qa_agent:          "pending",
      deployment_agent:  "pending"
    },


    // ── Audit history ─────────────────────────────────────────────────────────

    history: data.history || []
    // Shape of each history entry:
    // {
    //   timestamp:  string (ISO),
    //   agent:      string,
    //   event:      string,
    //   detail:     any
    // }

  };

}


// ── Schema helpers ────────────────────────────────────────────────────────────

/**
 * Advance the project to the next agent stage.
 *
 * @param {object} project    - Existing project schema object
 * @param {string} agentKey   - Key from agentPipeline (e.g. "technology_agent")
 * @param {string} [status]   - New project status string
 * @returns {object}          - Mutated project (also returns for chaining)
 */
export function advanceToAgent(project, agentKey, status) {
  project.currentAgent = agentKey;
  if (status) project.status = status;
  project.updatedAt = new Date().toISOString();
  return project;
}


/**
 * Mark an agent stage complete in the pipeline tracker and append history.
 *
 * @param {object} project   - Existing project schema object
 * @param {string} agentKey  - Key from agentPipeline
 * @param {string} result    - "completed" | "failed" | "skipped"
 * @param {any}    [detail]  - Optional output to log in history
 * @returns {object}
 */
export function recordAgentResult(project, agentKey, result, detail = null) {
  project.agentPipeline[agentKey] = result;
  project.history.push({
    timestamp: new Date().toISOString(),
    agent:     agentKey,
    event:     result,
    detail
  });
  project.updatedAt = new Date().toISOString();
  return project;
}
