// ── ANNEXE AI — Project Factory ───────────────────────────────────────────────
//
// File location in project:  api/projects/factory.js
//
// Owns project creation and pipeline startup.
// No HTTP logic — can be called from any entry point:
//   api/projects/create.js  (HTTP handler)
//   webhooks, admin triggers, scheduled jobs, etc.
//
// Responsibility boundary:
//   factory.js     → create project record + start pipeline
//   pipeline.js    → agent execution, ordering, memory tracking
//   create.js      → HTTP only
//
// ─────────────────────────────────────────────────────────────────────────────

import { createProjectSchema } from "./schema.js";
import { runProjectPipeline }  from "../orchestrator/pipeline.js";


/**
 * createProjectFactory
 *
 * Creates a project record and runs the full agent pipeline.
 *
 * @param {object} input
 * @param {string} input.clientName   - Client contact name
 * @param {string} input.companyName  - Company name
 * @param {string} [input.industry]   - Industry / sector
 * @param {string} [input.challenge]  - Business challenge described by client
 * @param {string} [input.solution]   - Desired solution described by client
 * @param {object} [input.blueprint]  - Optional blueprint data from chat layer
 *
 * @returns {object}
 *   {
 *     success:        boolean,
 *     message:        string,
 *     project:        object,    // enriched project with all agent outputs
 *     pipeline:       object     // { pipelineStatus, agentRuns, finalStatus }
 *   }
 */
export async function createProjectFactory({
  clientName  = null,
  companyName = null,
  industry    = "Not defined",
  challenge   = "Not defined",
  solution    = "Not defined",
  blueprint   = {}
} = {}) {

  // ── 1. Create project record ──────────────────────────────────────────────

  const project = createProjectSchema({
    clientName,
    companyName,
    industry,
    status:       "pipeline_pending",
    currentAgent: "requirement_agent"
  });

  // Attach chat-layer fields (preserved for chat.js compatibility)
  project.challenge = challenge;
  project.solution  = solution;
  project.blueprint = blueprint;

  console.log("[FACTORY] Project created:", project.projectId);


  // ── 2. Run the full agent pipeline ───────────────────────────────────────

  const pipelineResult = await runProjectPipeline(project);


  // ── 3. Resolve human-readable message ────────────────────────────────────

  const finalStatus = pipelineResult.finalStatus || pipelineResult.project?.status;

  const message = pipelineResult.success
    ? finalStatus === "development_unlocked"
      ? "ANNEXE project created and development is unlocked"
      : "ANNEXE project created — awaiting client approval and payment"
    : `ANNEXE project created — pipeline failed at ${pipelineResult.failedAgent}`;


  // ── 4. Return unified result ──────────────────────────────────────────────

  return {
    success: pipelineResult.success,
    message,

    // Enriched project produced by the pipeline
    project: pipelineResult.project || project,

    // Pipeline metadata (status per agent, run records, final state)
    pipeline: {
      pipelineStatus: pipelineResult.pipelineStatus || {},
      agentRuns:      pipelineResult.agentRuns      || [],
      finalStatus:    finalStatus                   || "unknown"
    }
  };

}
