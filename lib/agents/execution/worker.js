import runExecution              from "../../execution/runner.js";
import { SandboxManager }        from "../../sandbox/manager.js";


/*
  ANNEXE AGENT SYSTEM
  api/agents/execution/worker.js

  Purpose:
  Adapter between the ANNEXE orchestrator and the execution engine.

  Responsibility:
  - Validate incoming agent contract
  - Create an isolated sandbox workspace when generatedFiles are provided
    and no explicit cwd is supplied
  - Call runExecution() from the execution engine
  - Translate execution result into agent contract shape

  Does NOT:
  - Modify source files
  - Patch or repair code
  - Call the debug worker
  - Run git operations
  - Deploy to any environment
  - Clean up sandbox directories (reserved for cleanup.js)
*/


// ── Module-level SandboxManager instance ─────────────────────────────────────

const sandboxManager = new SandboxManager();


// ── run ───────────────────────────────────────────────────────────────────────

export async function run({
  projectId,
  buildReport,
  generatedFiles,
  technology,
  cwd
} = {}) {


  // ── 1. VALIDATE projectId ────────────────────────────

  if (!projectId) {
    return {
      success: false,
      agent: "execution_worker",
      status: "BUILD_FAILED",
      errorLogs: {
        errors: ["projectId is required"],
        warnings: [],
        output: "",
        commands: []
      },
      executionReport: {}
    };
  }


  // ── 2. VALIDATE payload ──────────────────────────────

  const hasPayload =
    (buildReport && typeof buildReport === "object") ||
    (Array.isArray(generatedFiles) && generatedFiles.length > 0);

  if (!hasPayload) {
    return {
      success: false,
      agent: "execution_worker",
      status: "BUILD_FAILED",
      errorLogs: {
        errors: [
          "Execution requires either buildReport or generatedFiles"
        ],
        warnings: [],
        output: "",
        commands: []
      },
      executionReport: {}
    };
  }


  // ── 3. RESOLVE EXECUTION DIRECTORY ──────────────────
  //
  // If the caller supplied an explicit cwd, honour it (backward compat).
  // Otherwise, when generatedFiles are present, spin up an isolated sandbox
  // workspace and use its path as the execution directory.

  let executionCwd = cwd || null;

  if (!executionCwd && Array.isArray(generatedFiles) && generatedFiles.length > 0) {

    const sandboxResult = await sandboxManager.create({
      projectId,
      generatedFiles
    });

    if (!sandboxResult.success) {
      return {
        success: false,
        agent: "execution_worker",
        status: "BUILD_FAILED",
        errorLogs: {
          errors: [
            `Sandbox workspace creation failed: ${sandboxResult.error}`
          ],
          warnings: [],
          output: "",
          commands: []
        },
        executionReport: {}
      };
    }

    executionCwd = sandboxResult.workspace.path;

    console.log(
      "ANNEXE EXECUTION WORKER — Sandbox workspace ready:",
      executionCwd
    );

  }


  // ── 4. EXECUTE ───────────────────────────────────────

  let result;

  try {

    result = await runExecution({
      projectId,
      buildReport,
      generatedFiles,
      technology,
      cwd: executionCwd
    });

  } catch (unexpectedError) {

    return {
      success: false,
      agent: "execution_worker",
      status: "BUILD_FAILED",
      errorLogs: {
        errors: [
          `Execution engine threw unexpectedly: ${unexpectedError.message}`
        ],
        warnings: [],
        output: "",
        commands: []
      },
      executionReport: {}
    };

  }


  // ── 5. TRANSLATE TO AGENT CONTRACT ───────────────────

  if (result.success) {

    return {
      success: true,
      agent: "execution_worker",
      status: "BUILD_SUCCESS",
      executionReport: result.executionReport
    };

  }

  return {
    success: false,
    agent: "execution_worker",
    status: "BUILD_FAILED",
    failedAt: result.failedAt || null,
    errorLogs: result.executionReport?.logs || {
      errors: [],
      warnings: [],
      output: "",
      commands: []
    },
    executionReport: result.executionReport || {}
  };

}


export default run;
