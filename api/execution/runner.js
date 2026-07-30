import { detectEnvironment } from "./environment.js";
import { runCommand } from "./command-runner.js";
import { processLogs } from "./logs.js";


/*
  ANNEXE EXECUTION ENGINE
  runner.js

  Purpose:
  Execution controller. Coordinates environment detection,
  command execution, and log processing into a single
  structured execution session.

  Responsibility:
  - Create session metadata
  - Detect runtime environment
  - Resolve commands for detected stack
  - Execute each command in sequence
  - Process every result through logs.js
  - Return a complete executionReport

  Does NOT:
  - Modify source files
  - Patch or repair code
  - Run git operations
  - Deploy to any environment
  - Retry failed commands
*/


/*
  Command sequences per detected runtime.
  Kept here so adding a new stack (Ruby, Go, etc.)
  is a single-location change.
*/

const COMMAND_PLANS = {

  node: [
    "npm install",
    "npm run build",
    "npm test"
  ],

  python: [
    "pip install -r requirements.txt",
    "pytest"
  ]

};


function resolveCommands(environment = {}) {

  const runtime =
    environment.runtime?.toLowerCase() || "";

  if (runtime.includes("node") ||
      runtime.includes("npm")) {
    return COMMAND_PLANS.node;
  }

  if (runtime.includes("python") ||
      runtime.includes("pip")) {
    return COMMAND_PLANS.python;
  }

  // Default: attempt Node sequence
  return COMMAND_PLANS.node;

}


function sessionId(projectId) {
  return `${projectId}-exec-${Date.now()}`;
}


export async function runExecution({
  projectId,
  buildReport = {},
  generatedFiles = [],
  technology = {},
  cwd = process.cwd()
} = {}) {


  if (!projectId) {
    return {
      success: false,
      projectId: null,
      status: "EXECUTION_FAILED",
      executionReport: {
        environment: {},
        commands: [],
        logs: {
          errors: ["projectId is required"],
          warnings: [],
          output: "",
          commands: []
        }
      }
    };
  }


  const session = sessionId(projectId);
  const executionStartTime = Date.now();


  // ── 1. ENVIRONMENT DETECTION ─────────────────────────

  let environment = {};

  try {
    environment = await detectEnvironment({ cwd });
  } catch (envError) {
    return {
      success: false,
      projectId,
      status: "EXECUTION_FAILED",
      executionReport: {
        environment: {},
        commands: [],
        logs: {
          errors: [
            `Environment detection failed: ${envError.message}`
          ],
          warnings: [],
          output: "",
          commands: []
        }
      }
    };
  }


  // ── 2. COMMAND RESOLUTION ────────────────────────────

  const commands = resolveCommands(environment);


  // ── 3. SEQUENTIAL COMMAND EXECUTION ─────────────────

  const commandResults = [];
  const aggregatedLogs = {
    errors: [],
    warnings: [],
    output: "",
    commands: []
  };

  let executionFailed = false;
  let failedCommand = null;

  for (const command of commands) {

    const commandResult = await runCommand({
      command,
      cwd,
      timeout: 120000
    });

    commandResults.push(commandResult);

    // ── 4. LOG PROCESSING PER COMMAND ─────────────────

    const logs = processLogs({ commandResult });

    // Accumulate errors
    for (const e of logs.errors) {
      if (!aggregatedLogs.errors.includes(e)) {
        aggregatedLogs.errors.push(e);
      }
    }

    // Accumulate warnings
    for (const w of logs.warnings) {
      if (!aggregatedLogs.warnings.includes(w)) {
        aggregatedLogs.warnings.push(w);
      }
    }

    // Accumulate output
    if (logs.output) {
      aggregatedLogs.output +=
        (aggregatedLogs.output ? "\n\n" : "") +
        `[${command}]\n${logs.output}`;
    }

    // Track command history
    aggregatedLogs.commands.push(command);

    // Stop sequence on first failure
    if (!commandResult.success) {
      executionFailed = true;
      failedCommand = command;
      break;
    }

  }


  // ── 5. EXECUTION REPORT ──────────────────────────────

  const duration = Date.now() - executionStartTime;

  if (executionFailed) {

    return {
      success: false,
      projectId,
      session,
      status: "EXECUTION_FAILED",
      failedAt: failedCommand,
      executionReport: {
        environment,
        commands: commandResults,
        logs: aggregatedLogs,
        duration
      }
    };

  }

  return {
    success: true,
    projectId,
    session,
    status: "EXECUTION_COMPLETE",
    executionReport: {
      environment,
      commands: commandResults,
      logs: aggregatedLogs,
      duration
    }
  };

}


export default runExecution;
