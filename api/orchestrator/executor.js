/*
  ANNEXE AI — Agent Execution Pipeline
  FILE: api/orchestrator/executor.js

  AgentExecutor
  Resolves agents from the registry and executes them.
  Routes results through ResultManager.
  In-memory only. No external dependencies. No API calls.

  Phase 8.1 integration:
  When execution_worker fails, the result is routed through the debug bridge
  and submitted to DebugApprovalService. The executor returns PENDING_APPROVAL
  so the caller can surface the debugId to the approval workflow.
  No automatic approval, no automatic repair, no retry.
*/


import { AgentRegistry }               from "./agents.js";
import { ResultManager }               from "./results.js";
import { sendExecutionFailureToDebug } from "./execution-debug-bridge.js";
import { DebugApprovalService }        from "./debug-approval-service.js";


/*
  AgentExecutor

  Orchestrates the per-task execution lifecycle:
  registry lookup → execute → store result → return.
*/

export class AgentExecutor {


  constructor() {

    this.registry        = new AgentRegistry();
    this.resultManager   = new ResultManager();
    this.approvalService = new DebugApprovalService();

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

    Returns on execution_worker failure (Phase 8.1):
    {
      success:   false,
      taskId:    string,
      status:    "PENDING_APPROVAL",
      debugId:   string,
      diagnosis: object,
      patchPlan: array
    }

    Returns on other failure:
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


      // ── Phase 8.1: Route execution_worker failures into approval workflow ──
      //
      // 1. Send failure to debug bridge → get diagnosis + patchPlan
      // 2. Submit to DebugApprovalService → get debugId
      // 3. Return PENDING_APPROVAL so caller can surface the debugId
      //
      // No automatic approval. No automatic repair. No retry.
      // Failure storage above is preserved (ResultManager already called).

      if (task?.agent === "execution_worker") {

        try {

          // Step 1 — Debug bridge: execution failure → diagnosis + patchPlan
          const debugOutcome = sendExecutionFailureToDebug({
            projectId:       task.projectId,
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

          if (debugOutcome.success) {

            const { debugResult } = debugOutcome;

            // Step 2 — Submit to approval service
            // debugResult carries diagnosis and patchPlan from the debug worker
            const submitOutcome = this.approvalService.submitForApproval({
              projectId: task.projectId,
              diagnosis: debugResult?.diagnosis || { status: "unknown", errors: [] },
              patchPlan: debugResult?.patchPlan || []
            });

            console.log(
              "ANNEXE EXECUTOR — Approval submitted:",
              taskId,
              submitOutcome.success
                ? `debugId=${submitOutcome.debugId}`
                : `submit error: ${submitOutcome.error}`
            );

            // Step 3 — Return PENDING_APPROVAL with debugId surfaced to caller
            if (submitOutcome.success) {

              return {
                success:   false,
                taskId,
                status:    "PENDING_APPROVAL",
                debugId:   submitOutcome.debugId,
                diagnosis: debugResult?.diagnosis || null,
                patchPlan: debugResult?.patchPlan || []
              };

            }

          }

        } catch (debugErr) {

          // Debug/approval failure must never crash the executor
          console.log(
            "ANNEXE EXECUTOR — Debug bridge threw (non-fatal):",
            taskId,
            debugErr.message
          );

        }

      }
      // ── End Phase 8.1 block ──────────────────────────────────────────────


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
