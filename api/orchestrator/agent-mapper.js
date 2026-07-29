// ── ANNEXE AI — Agent Adapters ────────────────────────────────────────────────
//
// Translates generic orchestrator task inputs into typed agent calls.
// Each case maps a worker name → agent function → standardised result.
//
// Worker registry:
//   backend_worker     — calls backend planning agent
//   frontend_worker    — calls frontend planning agent
//   generation_worker  — calls code generation pipeline
//   repository_worker  — connects generation result to repository layer
//
// ─────────────────────────────────────────────────────────────────────────────

import { integrateGenerationResult } from "../repository/integration.js";


// ── Placeholder worker functions ──────────────────────────────────────────────
//
// backend_worker and frontend_worker exist from prior phases.
// These are the stubs that match the described contract.

async function runBackendWorker(taskInput) {
  return {
    success: true,
    agent:   "backend_worker",
    plan: {
      projectId: taskInput.projectId,
      task:      taskInput.task || {},
      layers:    ["API Gateway", "Business Logic", "Data Layer"],
      status:    "planned"
    }
  };
}

async function runFrontendWorker(taskInput) {
  return {
    success: true,
    agent:   "frontend_worker",
    plan: {
      projectId: taskInput.projectId,
      task:      taskInput.task || {},
      components: ["Layout", "Dashboard", "Forms"],
      status:    "planned"
    }
  };
}

async function runGenerationWorker(taskInput) {
  // generation_worker runs the full generate → sandbox → validate pipeline.
  // Stub that matches the contract used by test-generation-worker.js.
  const files = taskInput.plan?.components || taskInput.plan?.layers || [];
  return {
    success: true,
    agent:   "generation_worker",
    generatedFiles: files.map((name, i) => ({
      path:    `src/${String(name).toLowerCase().replace(/\s+/g, "-")}.js`,
      content: `// ${name}\nexport default {};`
    })),
    validation: { success: true },
    projectId: taskInput.projectId
  };
}


// ── Main adapter dispatcher ───────────────────────────────────────────────────

/**
 * runAgentAdapter
 *
 * @param {string} workerName  - e.g. "repository_worker"
 * @param {object} taskInput   - Payload for the worker
 * @returns {object}           - Standardised agent result
 */
export async function runAgentAdapter(workerName, taskInput = {}) {

  switch (workerName) {

    // ── Backend planning worker ─────────────────────────────────────────────

    case "backend_worker": {
      const result = await runBackendWorker(taskInput);
      return { ...result, agent: "backend_worker" };
    }

    // ── Frontend planning worker ────────────────────────────────────────────

    case "frontend_worker": {
      const result = await runFrontendWorker(taskInput);
      return { ...result, agent: "frontend_worker" };
    }

    // ── Code generation worker ──────────────────────────────────────────────

    case "generation_worker": {
      const result = await runGenerationWorker(taskInput);
      return { ...result, agent: "generation_worker" };
    }

    // ── Repository integration worker ───────────────────────────────────────
    //
    // WHY: Connects completed generation results to the repository layer.
    // Receives:
    //   taskInput.projectId       — project identifier
    //   taskInput.task            — the task that was generated for
    //   taskInput.generationResult — output from generation_worker
    //
    // Delegates entirely to integrateGenerationResult() — no git/GitHub calls here.

    case "repository_worker": {

      const result = await integrateGenerationResult({
        projectId:        taskInput.projectId,
        task:             taskInput.task             || {},
        generationResult: taskInput.generationResult || {},
        repositoryUrl:    taskInput.repositoryUrl    || null
      });

      return { ...result, agent: "repository_worker" };
    }

    // ── Unknown worker ──────────────────────────────────────────────────────

    default:
      return {
        success: false,
        agent:   workerName,
        error:   `Unknown worker: ${workerName}`
      };
  }

}
