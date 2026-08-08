// ── ANNEXE AI — Rebuild Verification Service ─────────────────────────────────
//
// Phase 7.3
//
// Orchestration layer: applies an approved repair then immediately verifies
// whether it fixed the project by running the execution worker.
//
// Flow:
//   verifyRepair(input)
//       │
//       ├─ repairExecutionService.executeRepair()   (Phase 7.2)
//       │       failure → { success:false, stage:"PATCH", ... }
//       │
//       └─ executionWorker.run()
//               success → { success:true,  stage:"BUILD", status:"BUILD_SUCCESS", ... }
//               failure → { success:false, stage:"BUILD", status:"BUILD_FAILED",  ... }
//
// Does NOT:
//   - Generate new patches
//   - Call debug worker
//   - Auto-retry on failure
//   - Auto-approve anything
//   - Modify PatchExecutor or ExecutionWorker
//
// ─────────────────────────────────────────────────────────────────────────────

import { RepairExecutionService } from "./repair-execution-service.js";


// ── ExecutionWorker wrapper ───────────────────────────────────────────────────
//
// Thin class wrapping the named `run` export from the execution agent so the
// service can accept it via dependency injection and tests can mock it cleanly.

class ExecutionWorker {

  async run(taskInput) {
    // Dynamic import avoids circular dependency with the agent tree and keeps
    // this module loadable even when the execution agent is not present.
    const { run } = await import("../agents/execution/worker.js");
    return run(taskInput);
  }

}


// ── RebuildVerificationService ────────────────────────────────────────────────

export class RebuildVerificationService {

  /**
   * @param {object}                 [options]
   * @param {RepairExecutionService} [options.repairExecutionService] - Injected repair service.
   * @param {object}                 [options.executionWorker]        - Object with async run().
   *
   * Creates internal instances for either dependency if omitted.
   */
  constructor({
    repairExecutionService = null,
    executionWorker        = null
  } = {}) {

    this._repairExecutionService = repairExecutionService || new RepairExecutionService();
    this._executionWorker        = executionWorker        || new ExecutionWorker();

  }


  // ── verifyRepair ────────────────────────────────────────────────────────────
  //
  // Apply the approved patch plan then run the execution worker to confirm
  // the repair succeeded.
  //
  // @param {object}   input
  // @param {string}   input.projectId      - Target project (required)
  // @param {string}   input.debugId        - Approval record key (required)
  // @param {object[]} input.patchPlan      - Array of patch entries (required)
  // @param {object}   [input.technology]   - Technology stack context for build
  // @param {string}   [input.buildReport]  - Prior build report (context for worker)
  // @param {object[]} [input.generatedFiles] - File list for execution worker
  // @param {string}   [input.cwd]          - Working directory override
  //
  // @returns {Promise<object>} Result contract

  async verifyRepair(input = {}) {

    const {
      projectId,
      debugId,
      patchPlan,
      technology,
      buildReport,
      generatedFiles,
      cwd
    } = input;


    // ── 1. Validate inputs ────────────────────────────────────────────────────

    if (!projectId) {
      return {
        success: false,
        stage:   "PATCH",
        error:   "projectId is required"
      };
    }

    if (!debugId) {
      return {
        success: false,
        stage:   "PATCH",
        error:   "debugId is required"
      };
    }

    if (!Array.isArray(patchPlan)) {
      return {
        success: false,
        stage:   "PATCH",
        error:   "patchPlan must be an array"
      };
    }


    // ── 2. Execute repair ─────────────────────────────────────────────────────

    let patchResult;

    try {

      patchResult = await this._repairExecutionService.executeRepair({
        projectId,
        debugId,
        patchPlan
      });

    } catch (err) {

      return {
        success:     false,
        stage:       "PATCH",
        error:       `RepairExecutionService threw unexpectedly: ${err instanceof Error ? err.message : String(err)}`,
        patchResult: null
      };

    }

    if (!patchResult.success) {
      return {
        success:     false,
        stage:       "PATCH",
        error:       patchResult.error || "Repair execution failed",
        patchResult
      };
    }


    // ── 3. Execute build ──────────────────────────────────────────────────────

    let executionResult;

    try {

      executionResult = await this._executionWorker.run({
        projectId,
        technology,
        buildReport,
        generatedFiles: generatedFiles || [],
        cwd:            cwd            || null
      });

    } catch (err) {

      return {
        success:         false,
        stage:           "BUILD",
        status:          "BUILD_FAILED",
        error:           `ExecutionWorker threw unexpectedly: ${err instanceof Error ? err.message : String(err)}`,
        patchResult,
        executionResult: null
      };

    }


    // ── 4. Resolve build outcome ──────────────────────────────────────────────

    if (executionResult?.success) {

      return {
        success:        true,
        stage:          "BUILD",
        status:         "BUILD_SUCCESS",
        patchResult,
        executionResult
      };

    }

    return {
      success:        false,
      stage:          "BUILD",
      status:         "BUILD_FAILED",
      error:          executionResult?.error || "Build failed after patch",
      patchResult,
      executionResult
    };

  }

}


export default RebuildVerificationService;
