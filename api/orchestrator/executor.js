/*
  ANNEXE AI — Agent Execution Pipeline
  FILE: api/orchestrator/executor.js

  AgentExecutor
  Resolves agents from the registry and executes them.
  Routes results through ResultManager.
  In-memory only. No external dependencies. No API calls.
*/


import { AgentRegistry }               from "./agents.js";
import { ResultManager }               from "./results.js";
import { sendExecutionFailureToDebug } from "./execution-debug-bridge.js";


/*
  AgentExecutor

  Orchestrates the per-task execution lifecycle:
  registry lookup → execute → store result → return.
*/

export class AgentExecutor {


  constructor() {

    this.registry      = new AgentRegistry();
    this.resultManager = new ResultManager();

  }


  /*
    executeTask(task)

    Executes the agent registered for the task's agent type.

    task shape:
    {
      id:    string,
      agent: string,   ← worker type used as registry key
      type:  string,
      ...
    }

    Returns on success:
    {
      success: true,
      taskId:  string,
      status:  "COMPLETED",
      result:  {}
    }

    Returns on failure:
    {
      success: false,
      taskId:  string,
      status:  "FAILED",
      error:   string
    }
  */

  async executeTask(task) {

    const taskId = task?.id || null;


    // 1. Find agent from registry
    const agent = this.registry.getAgent(task?.agent);


    // 2. No agent registered for this worker type
    if (!agent) {

      const error =
        `No agent registered for worker type '${task?.agent}'`;

      console.log(
        "ANNEXE EXECUTOR — Agent failed:",
        taskId,
        error
      );

      this.resultManager.handleFailure({
        taskId,
        agent: task?.agent || null,
        error
      });

      return {
        success: false,
        taskId,
        status:  "FAILED",
        error
      };

    }


    // 3. Log execution start
    console.log(
      "ANNEXE EXECUTOR — Agent started:",
      taskId,
      agent.name
    );


    // 4. Execute agent handler
    let agentResult;

    try {

      agentResult = await Promise.resolve(
        agent.execute(task)
      );

    }
    catch (err) {

      const error = err.message || "Agent threw an unexpected error";

      console.log(
        "ANNEXE EXECUTOR — Agent failed:",
        taskId,
        agent.name,
        error
      );

      this.resultManager.handleFailure({
        taskId,
        agent: agent.name,
        error
      });

      return {
        success: false,
        taskId,
        status:  "FAILED",
        error
      };

    }


    // Handle agent-reported failure
    if (!agentResult || agentResult.success === false) {

      const error =
        agentResult?.error ||
        agentResult?.message ||
        "Agent returned a failure result";

      console.log(
        "ANNEXE EXECUTOR — Agent failed:",
        taskId,
        agent.name,
        error
      );

      this.resultManager.handleFailure({
        taskId,
        agent: agent.name,
        error
      });

      // Route execution_worker failures to Debug Worker via bridge.
      // Runs after ResultManager so existing failure storage is unaffected.
      // Wrapped in try/catch: debug failure must never crash the executor.
      if (task?.agent === "execution_worker") {

        try {

          const debugOutcome = sendExecutionFailureToDebug({
            projectId:      task.projectId,
            executionResult: agentResult,
            generatedFiles:  task.generatedFiles || []
          });

          console.log(
            "ANNEXE EXECUTOR — Debug bridge result:",
            taskId,
            debugOutcome.success
              ? "diagnosis ready"
              : `bridge error: ${debugOutcome.error}`
          );

        } catch (debugErr) {

          console.log(
            "ANNEXE EXECUTOR — Debug bridge threw (non-fatal):",
            taskId,
            debugErr.message
          );

        }

      }

      return {
        success: false,
        taskId,
        status:  "FAILED",
        error
      };

    }


    // 5. Store successful result
    const stored = this.resultManager.handleSuccess({
      taskId,
      agent:  agent.name,
      result: agentResult
    });


    // 6. Log completion and return
    console.log(
      "ANNEXE EXECUTOR — Agent completed:",
      taskId,
      agent.name
    );

    return {
      success: true,
      taskId,
      status:  "COMPLETED",
      result:  stored.result
    };

  }

}
