// ── ANNEXE AI — Test Execution Agent ─────────────────────────────────────────
//
// Simulates test execution within a sandbox context.
// No real shell commands are run — this is an abstraction layer.
// Replace _simulateCommand() internals with container execution in a later phase.
//
// ─────────────────────────────────────────────────────────────────────────────

import { validateTestRequest }  from "./validator.js";
import { isCommandAllowed }     from "./commands.js";
import { analyzeResult }        from "./analyzer.js";


// ── Execution ID counter ──────────────────────────────────────────────────────

let _execSeq = 1;

function nextExecId() {
  return `EXEC-${Date.now()}-${_execSeq++}`;
}


// ── Simulated execution engine ────────────────────────────────────────────────
//
// Future: swap this for actual sandbox container invocation.

function _simulateCommand(command, department) {

  const lower = command.toLowerCase();

  // Deterministic failure trigger for test coverage
  if (lower.includes("fail")) {
    return {
      command,
      status:   "FAIL",
      output:   `Simulated failure for command: "${command}"`,
      duration: "0s",
      exitCode: 1
    };
  }

  // Simulate a realistic duration based on command type
  const duration = lower.includes("build")    ? "12s"
                 : lower.includes("lint")     ? "3s"
                 : lower.includes("pytest")   ? "5s"
                 : lower.includes("test")     ? "8s"
                 : lower.includes("migrat")   ? "2s"
                 : lower.includes("validat")  ? "1s"
                 : "1s";

  return {
    command,
    status:   "PASS",
    output:   `Simulated OK — ${command}`,
    duration,
    exitCode: 0
  };

}


// ── TestExecutionAgent ────────────────────────────────────────────────────────

export class TestExecutionAgent {

  constructor() {
    this.agentName  = "test_execution_agent";
    this._execStore = [];   // In-memory execution history
  }


  // ── runTests ────────────────────────────────────────────────────────────────

  runTests(request) {

    // 1. Validate request shape and command safety
    const { valid, errors } = validateTestRequest(request);

    if (!valid) {
      return {
        success: false,
        status:  "INVALID",
        errors,
        results: []
      };
    }

    const { sandboxId, taskId, department, commands } = request;

    const execId    = nextExecId();
    const startedAt = new Date().toISOString();

    // 2. Double-check each command (belt-and-braces after validator)
    const commandErrors = [];

    for (const cmd of commands) {
      const { allowed, reason } = isCommandAllowed(cmd, department);
      if (!allowed) {
        commandErrors.push(reason);
      }
    }

    if (commandErrors.length > 0) {
      return {
        success: false,
        status:  "DENIED",
        errors:  commandErrors,
        results: []
      };
    }

    // 3. Simulate execution of each command
    const results = commands.map(cmd => _simulateCommand(cmd, department));

    // 4. Determine overall status
    const anyFailed  = results.some(r => r.status === "FAIL");
    const overallStatus = anyFailed ? "FAILED" : "PASSED";

    // 5. Run result through analyzer
    const analysis = analyzeResult({ status: overallStatus, results });

    // 6. Persist execution record
    const execution = {
      execId,
      sandboxId,
      taskId,
      department,
      agent:       this.agentName,
      commands,
      status:      overallStatus,
      results,
      analysis,
      startedAt,
      finishedAt:  new Date().toISOString()
    };

    this._execStore.push(execution);

    console.log(
      `TEST EXECUTION AGENT: [${execId}] ${overallStatus} — ${results.length} command(s) in sandbox ${sandboxId}`
    );

    return {
      success:  !anyFailed,
      execId,
      status:   overallStatus,
      results,
      analysis,
      errors:   anyFailed
        ? results.filter(r => r.status === "FAIL").map(r => r.output)
        : []
    };

  }


  // ── getExecutions ───────────────────────────────────────────────────────────

  /**
   * Returns the full in-memory execution history.
   *
   * @returns {object[]}
   */
  getExecutions() {
    return [...this._execStore];
  }

}


// ── Singleton export ──────────────────────────────────────────────────────────

export const testExecutionAgent = new TestExecutionAgent();


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { action, ...rest } = req.body || {};

    if (action === "history") {
      return res.status(200).json({
        success:    true,
        executions: testExecutionAgent.getExecutions()
      });
    }

    const result = testExecutionAgent.runTests(rest);

    return res.status(result.success ? 200 : 400).json(result);

  } catch (error) {

    console.error("TEST EXECUTION AGENT ERROR:", error);

    return res.status(500).json({ error: "Test execution failed" });

  }

}
