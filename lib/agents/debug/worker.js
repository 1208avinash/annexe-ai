// ── ANNEXE AI — Debug Worker ──────────────────────────────────────────────────
//
// Entry point for the debug agent.
// Delegates classification to analyzer.js and repair proposals to patcher.js.
// V1: read-only — diagnosis + patch plan only, no file writes.
//
// INPUT CONTRACT:
//   {
//     projectId,       string  — required
//     errorLogs,       string  — raw error log text
//     buildReport,     string  — build system report (may overlap errorLogs)
//     generatedFiles   Array   — file list from generation stage
//   }
//
// OUTPUT CONTRACT (success):
//   {
//     success:   true,
//     agent:     "debug_worker",
//     version:   string,
//     projectId: string,
//     diagnosis: object,   — from analyzer.js
//     patchPlan: Array,    — from patcher.js
//     _meta:     object
//   }
//
// OUTPUT CONTRACT (failure):
//   { success: false, agent, projectId, error }
//
// ─────────────────────────────────────────────────────────────────────────────

import { analyze }         from "./analyzer.js";
import { buildPatchPlan }  from "./patcher.js";


// ── Constants ─────────────────────────────────────────────────────────────────

const AGENT_ID = "debug_worker";
const VERSION  = "1.0.0";


// ── Main exported run() ───────────────────────────────────────────────────────

/**
 * run
 *
 * @param {object}   input
 * @param {string}   input.projectId        - Project identifier (required)
 * @param {string}   [input.errorLogs]      - Raw error log text
 * @param {string}   [input.buildReport]    - Build system report
 * @param {string[]} [input.generatedFiles] - File paths from generation stage
 *
 * @returns {object} Debug worker output
 */
export function run({
  projectId      = null,
  errorLogs      = "",
  buildReport    = "",
  generatedFiles = []
} = {}) {


  // ── Guard: projectId required ─────────────────────────────────────────────

  if (!projectId) {
    return {
      success:   false,
      agent:     AGENT_ID,
      projectId: null,
      error:     "projectId is required"
    };
  }


  // ── Guard: at least one log source required ───────────────────────────────

  const combinedLogs = [errorLogs, buildReport].filter(Boolean).join("\n");

  if (!combinedLogs.trim()) {
    return {
      success:   false,
      agent:     AGENT_ID,
      projectId,
      error:     "No error logs or build report provided — nothing to debug"
    };
  }


  // ── Analyze: classify errors and extract affected files ───────────────────

  const diagnosis = analyze({
    errorLogs,
    buildReport,
    generatedFiles
  });


  // ── Patch: build repair proposals from diagnosis ──────────────────────────

  const patchPlan = buildPatchPlan(diagnosis);


  // ── Assemble response ─────────────────────────────────────────────────────

  return {
    success:   true,
    agent:     AGENT_ID,
    version:   VERSION,
    projectId,

    diagnosis,
    patchPlan,

    _meta: {
      projectId,
      generatedFileCount: generatedFiles.length,
      logSources: [
        errorLogs   ? "errorLogs"   : null,
        buildReport ? "buildReport" : null
      ].filter(Boolean),
      patchCount: patchPlan.length,
      analyzedAt: new Date().toISOString()
    }
  };

}


// ── HTTP handler (standalone Vercel deployment) ───────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      projectId,
      errorLogs,
      buildReport,
      generatedFiles
    } = req.body || {};

    const result = run({ projectId, errorLogs, buildReport, generatedFiles });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {

    console.error("DEBUG WORKER ERROR:", error);

    return res.status(500).json({ error: "Debug worker failed" });

  }

}
