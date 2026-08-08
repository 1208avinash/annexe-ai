// ── ANNEXE AI — Agent Memory Schema ──────────────────────────────────────────
//
// Defines memory structures for the ANNEXE agent pipeline.
// Phase 2 Foundation: schema definitions only — no database integration yet.
// Designed for future adapter pattern (Postgres, Redis, Vercel KV, etc.)
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Project Memory ────────────────────────────────────────────────────────────
//
// One record per client project, updated as each agent completes its stage.

export function createProjectMemory(overrides = {}) {
  return {
    // ── Identity ──────────────────────────────────────────────────────────
    projectId:   overrides.projectId   || null,
    clientName:  overrides.clientName  || null,
    companyName: overrides.companyName || null,
    industry:    overrides.industry    || null,
    createdAt:   overrides.createdAt   || new Date().toISOString(),
    updatedAt:   new Date().toISOString(),

    // ── Structured requirements (from Requirement Agent) ──────────────────
    requirements: overrides.requirements || {
      problem:         null,
      businessGoal:    null,
      users:           [],
      features:        [],
      constraints:     [],
      projectType:     null,
      priority:        null,
      confidenceScore: 0
    },

    // ── Agent decisions log ───────────────────────────────────────────────
    decisions: overrides.decisions || {
      technology:   null,   // output of Technology Intelligence Agent
      architecture: null,   // output of Architect Agent
      development:  null,   // output of Developer Agent
      qa:           null,   // reserved
      deployment:   null    // reserved
    },

    // ── Final architecture artifact ───────────────────────────────────────
    architecture: overrides.architecture || null,

    // ── Changelog for audit trail ─────────────────────────────────────────
    changes: overrides.changes || [],

    // ── Pipeline status ───────────────────────────────────────────────────
    status: overrides.status || "pending",

    agentPipeline: overrides.agentPipeline || {
      requirement_agent: "pending",
      product_agent:     "pending",
      technology_agent:  "pending",
      architect_agent:   "pending",
      developer_agent:   "pending",
      qa_agent:          "pending",
      testing_agent:     "pending",
      deployment_agent:  "pending"
    }
  };
}


// ── Organization Memory ───────────────────────────────────────────────────────
//
// Shared knowledge base across all projects for ANNEXE as a software factory.
// Future: seeded from completed projects and approved module library.

export function createOrganizationMemory(overrides = {}) {
  return {
    // ── Reusable software modules ─────────────────────────────────────────
    reusableModules: overrides.reusableModules || [],
    // Shape of each module:
    // {
    //   moduleId:    string,
    //   name:        string,
    //   description: string,
    //   category:    "auth" | "payments" | "chat" | "crm" | "dashboard" | "api",
    //   technology:  string,
    //   usedIn:      string[],   // projectIds
    //   maturity:    "prototype" | "stable" | "production"
    // }

    // ── Reference to past projects ────────────────────────────────────────
    previousProjects: overrides.previousProjects || [],
    // Shape:
    // {
    //   projectId:   string,
    //   companyName: string,
    //   industry:    string,
    //   projectType: string,
    //   outcome:     "success" | "cancelled" | "in-progress"
    // }

    // ── Codified best practices ───────────────────────────────────────────
    bestPractices: overrides.bestPractices || [],
    // Shape:
    // {
    //   practiceId:  string,
    //   category:    string,
    //   description: string,
    //   appliesTo:   string[]  // projectTypes
    // }

    updatedAt: new Date().toISOString()
  };
}


// ── Agent Memory ──────────────────────────────────────────────────────────────
//
// Per-agent knowledge store. Allows agents to improve over time
// without retraining the underlying LLM.

export function createAgentMemory(overrides = {}) {
  return {
    agentName: overrides.agentName || null,

    // ── What this agent knows (seeded domain knowledge) ───────────────────
    knowledge: overrides.knowledge || [],
    // Shape:
    // {
    //   topic:       string,
    //   content:     string,
    //   confidence:  number,   // 0–1
    //   source:      "hardcoded" | "learned" | "human-approved"
    // }

    // ── What this agent has learned from completed projects ────────────────
    lessons: overrides.lessons || [],
    // Shape:
    // {
    //   lessonId:    string,
    //   context:     string,
    //   outcome:     string,
    //   appliedAt:   string   // ISO timestamp
    // }

    updatedAt: new Date().toISOString()
  };
}


// ── Memory helpers ────────────────────────────────────────────────────────────

/**
 * Append a change record to project memory changelog.
 */
export function logChange(projectMemory, { agent, field, value, reason = "" }) {
  projectMemory.changes.push({
    timestamp: new Date().toISOString(),
    agent,
    field,
    value,
    reason
  });
  projectMemory.updatedAt = new Date().toISOString();
  return projectMemory;
}

/**
 * Mark an agent stage as complete in the pipeline tracker.
 */
export function markAgentComplete(projectMemory, agentKey) {
  if (projectMemory.agentPipeline[agentKey] !== undefined) {
    projectMemory.agentPipeline[agentKey] = "completed";
    projectMemory.updatedAt = new Date().toISOString();
  }
  return projectMemory;
}
