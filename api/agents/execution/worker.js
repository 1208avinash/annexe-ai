import runExecution from "../../execution/runner.js";


/*
  ANNEXE AGENT SYSTEM
  api/agents/execution/worker.js

  Purpose:
  Adapter between the ANNEXE orchestrator and the execution engine.

  Responsibility:
  - Validate incoming agent contract
  - Call runExecution() from the execution engine
  - Translate execution result into agent contract shape

  Does NOT:
  - Modify source files
  - Patch or repair code
  - Call the debug worker
  - Run git operations
  - Deploy to any environment
*/


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


  // ── 3. EXECUTE ───────────────────────────────────────

  let result;

  try {

    result = await runExecution({
      projectId,
      buildReport,
      generatedFiles,
      technology,
      cwd
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


  // ── 4. TRANSLATE TO AGENT CONTRACT ───────────────────

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
