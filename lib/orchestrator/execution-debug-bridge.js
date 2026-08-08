/*
  ANNEXE AI — EXECUTION → DEBUG BRIDGE
  =======================================
  WHY THIS FILE EXISTS:
  The Execution Worker can produce BUILD_FAILED reports shaped as:
    { success: false, executionReport: { logs, commands } }

  The Debug Worker expects:
    { projectId, errorLogs, buildReport, generatedFiles }

  This bridge owns the translation between those two contracts.
  It extracts the right fields, maps them, calls debug_worker.run(),
  and returns the structured diagnosis.

  V1 CONTRACT:
  - Input:  { projectId, executionResult, generatedFiles }
  - Output: { success: true,  debugResult }
         OR { success: false, error }

  RULES:
  - DO NOT modify debug_worker / analyzer / patcher / execution worker
  - DO NOT auto-apply patches
  - V1 is diagnosis handoff only
*/

import { run as debugRun } from "../agents/debug/worker.js";


/*
  extractDebugInput
  Pure function — maps execution failure output to debug worker input contract.

  @param {string}   projectId
  @param {object}   executionResult  — { success: false, executionReport: { logs, commands } }
  @param {string[]} generatedFiles   — file list from generation stage

  @returns {{ projectId, errorLogs, buildReport, generatedFiles }}
*/
function extractDebugInput(projectId, executionResult, generatedFiles) {

  const report = executionResult?.executionReport || {};

  // logs  → errorLogs  (raw stderr / mixed output from the run)
  // commands → buildReport (serialised command trace gives build context)
  //
  // logs may arrive as:
  //   string  — join as-is
  //   array   — join with newline
  //   object  — flatten all string values with newline (handles { errors, output, … })
  //   other   — empty string
  function flattenLogs(raw) {
    if (typeof raw === "string")  return raw;
    if (Array.isArray(raw))       return raw.join("\n");
    if (raw && typeof raw === "object") {
      return Object.values(raw)
        .flatMap(v => Array.isArray(v) ? v : [v])
        .filter(v => typeof v === "string")
        .join("\n");
    }
    return "";
  }

  const errorLogs = flattenLogs(report.logs);

  const buildReport =
    Array.isArray(report.commands)
      ? report.commands
          .map((cmd, i) =>
            typeof cmd === "string"
              ? `[step ${i + 1}] ${cmd}`
              : `[step ${i + 1}] ${JSON.stringify(cmd)}`
          )
          .join("\n")
      : typeof report.commands === "string"
        ? report.commands
        : "";

  // generatedFiles may arrive as string[] or object[] with a .path property.
  // analyzer.js expects string[] — normalise here.
  const normalizedFiles = Array.isArray(generatedFiles)
    ? generatedFiles.map(f =>
        typeof f === "string" ? f : (f?.path ?? "")
      ).filter(Boolean)
    : [];

  return {
    projectId,
    errorLogs,
    buildReport,
    generatedFiles: normalizedFiles
  };

}


/*
  sendExecutionFailureToDebug
  Main export.

  @param {object} input
  @param {string}   input.projectId        — required
  @param {object}   input.executionResult  — required; expected success: false
  @param {string[]} [input.generatedFiles] — file list from generation stage

  @returns {{ success: true, debugResult } | { success: false, error }}
*/
export function sendExecutionFailureToDebug({
  projectId       = null,
  executionResult = null,
  generatedFiles  = []
} = {}) {

  // ── Guard: projectId ────────────────────────────────────────────────────

  if (!projectId) {
    return {
      success: false,
      error:   "projectId is required"
    };
  }


  // ── Guard: executionResult must be present ──────────────────────────────

  if (!executionResult) {
    return {
      success: false,
      error:   "executionResult is required"
    };
  }


  // ── Guard: only route actual failures ──────────────────────────────────

  if (executionResult.success === true) {
    return {
      success: false,
      error:   "executionResult.success is true — no failure to debug"
    };
  }


  // ── Map execution failure → debug input contract ────────────────────────

  const debugInput = extractDebugInput(
    projectId,
    executionResult,
    generatedFiles
  );


  // ── Delegate to Debug Worker ────────────────────────────────────────────

  try {

    const debugResult = debugRun(debugInput);

    return {
      success: true,
      debugResult
    };

  } catch (err) {

    return {
      success: false,
      error:   err?.message || "Debug worker threw an unexpected error"
    };

  }

}


/*
  HTTP handler — standalone Vercel deployment

  POST /api/orchestrator/execution-debug-bridge
  Body: { projectId, executionResult, generatedFiles }
*/
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      projectId,
      executionResult,
      generatedFiles
    } = req.body || {};

    const result = sendExecutionFailureToDebug({
      projectId,
      executionResult,
      generatedFiles
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {

    console.error("EXECUTION-DEBUG BRIDGE ERROR:", error);

    return res.status(500).json({ error: "Bridge failed" });

  }

}
