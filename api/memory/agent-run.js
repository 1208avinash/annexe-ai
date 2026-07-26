// ── ANNEXE AI — Agent Execution Run Tracker ──────────────────────────────────
//
// Tracks every individual agent execution: input, output, timing, errors.
// No database — in-memory structure designed for future persistence.
//
// Usage pattern:
//
//   const run = createAgentRun({ projectId, agentName: "technology_agent", input });
//   try {
//     const output = runTechnologyAgent(input);
//     completeAgentRun(run, output);
//   } catch (err) {
//     failAgentRun(run, err);
//   }
//
// ─────────────────────────────────────────────────────────────────────────────


/**
 * createAgentRun
 *
 * Initialize a new agent execution record.
 * Call this immediately before invoking an agent.
 *
 * @param {object} data
 * @param {string} data.projectId  - Parent project ID
 * @param {string} data.agentName  - Agent identifier (matches agentPipeline key)
 * @param {any}    [data.input]    - Input passed to the agent
 * @returns {object} Agent run record (status: "running")
 */
export function createAgentRun({
  projectId = null,
  agentName = null,
  input     = null
} = {}) {

  return {
    id:          agentName + "-" + Date.now(),
    projectId,
    agentName,
    input,
    output:      null,
    status:      "running",    // "running" | "completed" | "failed"
    error:       null,
    startedAt:   new Date().toISOString(),
    completedAt: null,
    durationMs:  null
  };

}


/**
 * completeAgentRun
 *
 * Mark a run as successfully completed.
 * Mutates the run object in place and returns it.
 *
 * @param {object} run     - Run object from createAgentRun()
 * @param {any}    output  - Agent output to store
 * @returns {object}
 */
export function completeAgentRun(run, output) {

  const completedAt = new Date().toISOString();

  run.output      = output;
  run.status      = "completed";
  run.completedAt = completedAt;
  run.durationMs  = Date.now() - new Date(run.startedAt).getTime();

  return run;

}


/**
 * failAgentRun
 *
 * Mark a run as failed and capture the error.
 * Mutates the run object in place and returns it.
 *
 * @param {object}         run    - Run object from createAgentRun()
 * @param {Error|string}   error  - The error that caused failure
 * @returns {object}
 */
export function failAgentRun(run, error) {

  const completedAt = new Date().toISOString();

  run.error       = error instanceof Error ? error.message : String(error);
  run.status      = "failed";
  run.completedAt = completedAt;
  run.durationMs  = Date.now() - new Date(run.startedAt).getTime();

  return run;

}


/**
 * summariseRun
 *
 * Return a compact log-safe summary of a run (no large output blobs).
 *
 * @param {object} run
 * @returns {object}
 */
export function summariseRun(run) {
  return {
    id:         run.id,
    projectId:  run.projectId,
    agentName:  run.agentName,
    status:     run.status,
    durationMs: run.durationMs,
    error:      run.error       || null,
    startedAt:  run.startedAt,
    completedAt: run.completedAt
  };
}
