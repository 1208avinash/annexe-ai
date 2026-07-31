// ── ANNEXE AI — Repair Coordinator ───────────────────────────────────────────
//
// Phase 7.4
//
// Single responsibility:
//   Enforce retry policy over the existing repair pipeline.
//   Each call to repair() represents exactly ONE attempt.
//   The coordinator never loops, never auto-approves, never calls the
//   debug worker, and never generates a new patch.
//
// Pipeline position:
//   ExecutionWorker (failure)
//         ↓
//   DebugWorker → DebugApprovalService   (external — caller's responsibility)
//         ↓
//   RepairCoordinator.repair()
//         ↓
//   RebuildVerificationService.verifyRepair()
//         ↓
//   BUILD_SUCCESS | BUILD_FAILED | MAX_ATTEMPTS_REACHED
//
// Does NOT modify:
//   RepairExecutionService, RebuildVerificationService, PatchExecutor,
//   DebugApprovalService, ExecutionWorker, SandboxManager
//
// ─────────────────────────────────────────────────────────────────────────────

import { RebuildVerificationService } from "./rebuild-verification-service.js";
import { DebugApprovalService }       from "./debug-approval-service.js";


// ── RepairCoordinator ─────────────────────────────────────────────────────────

export class RepairCoordinator {

  /**
   * @param {object}                     [options]
   * @param {RebuildVerificationService} [options.rebuildVerificationService]
   * @param {DebugApprovalService}       [options.debugApprovalService]
   * @param {number}                     [options.maxAttempts=3]
   *
   * Creates internal instances for any omitted dependency.
   */
  constructor({
    rebuildVerificationService = null,
    debugApprovalService       = null,
    maxAttempts                = 3
  } = {}) {

    this._verifier      = rebuildVerificationService || new RebuildVerificationService();
    this._approvalSvc   = debugApprovalService       || new DebugApprovalService();
    this.maxAttempts    = maxAttempts;

    // projectId → { attempts, status, history: [...] }
    this.history = new Map();

  }


  // ── _getOrCreateRecord ────────────────────────────────────────────────────
  //
  // Load the project repair record, creating it on first access.

  _getOrCreateRecord(projectId) {

    if (!this.history.has(projectId)) {
      this.history.set(projectId, {
        projectId,
        attempts: 0,
        status:   "PENDING",
        history:  []
      });
    }

    return this.history.get(projectId);

  }


  // ── repair ────────────────────────────────────────────────────────────────
  //
  // Execute exactly ONE repair attempt for the given project.
  //
  // @param {object}   input
  // @param {string}   input.projectId      - Target project (required)
  // @param {string}   input.debugId        - Approval record key (required)
  // @param {object[]} input.patchPlan      - Patch entries to apply (required)
  // @param {object}   [input.technology]   - Technology stack context
  // @param {object[]} [input.generatedFiles] - File list for execution worker
  // @param {string}   [input.cwd]          - Working directory override
  // @param {string}   [input.buildReport]  - Prior build report context
  //
  // @returns {Promise<object>} Result contract

  async repair(input = {}) {

    const {
      projectId,
      debugId,
      patchPlan,
      technology,
      generatedFiles,
      cwd,
      buildReport
    } = input;


    // ── 1. Validate required inputs ─────────────────────────────────────────

    if (!projectId) {
      return { success: false, status: "ERROR", error: "projectId is required" };
    }

    if (!debugId) {
      return { success: false, status: "ERROR", error: "debugId is required" };
    }

    if (!Array.isArray(patchPlan)) {
      return { success: false, status: "ERROR", error: "patchPlan must be an array" };
    }


    // ── 2. Load or create project record ────────────────────────────────────

    const record = this._getOrCreateRecord(projectId);


    // ── 3. Enforce max attempts ─────────────────────────────────────────────

    if (record.attempts >= this.maxAttempts) {

      console.log(
        `[RepairCoordinator] MAX_ATTEMPTS_REACHED: ${projectId} ` +
        `(attempts=${record.attempts}, max=${this.maxAttempts})`
      );

      return {
        success:     false,
        status:      "MAX_ATTEMPTS_REACHED",
        projectId,
        attempts:    record.attempts,
        maxAttempts: this.maxAttempts
      };

    }


    // ── 4. Increment attempt counter ────────────────────────────────────────

    record.attempts += 1;
    const attempt = record.attempts;

    console.log(
      `[RepairCoordinator] Attempt ${attempt}/${this.maxAttempts}: ${projectId}`
    );


    // ── 5. Delegate to RebuildVerificationService ───────────────────────────

    let verifyResult;

    try {

      verifyResult = await this._verifier.verifyRepair({
        projectId,
        debugId,
        patchPlan,
        technology,
        generatedFiles,
        cwd,
        buildReport
      });

    } catch (err) {

      const error = err instanceof Error ? err.message : String(err);

      const historyEntry = {
        attempt,
        debugId,
        timestamp: new Date().toISOString(),
        result:    { success: false, status: "ERROR", error }
      };

      record.history.push(historyEntry);
      record.status = "ERROR";

      console.error(`[RepairCoordinator] verifyRepair threw on attempt ${attempt}:`, error);

      return {
        success:  false,
        status:   "ERROR",
        projectId,
        attempt,
        error
      };

    }


    // ── 6. Record history entry ─────────────────────────────────────────────

    const historyEntry = {
      attempt,
      debugId,
      timestamp: new Date().toISOString(),
      result:    verifyResult
    };

    record.history.push(historyEntry);


    // ── 7. Resolve outcome ──────────────────────────────────────────────────

    if (verifyResult.success && verifyResult.status === "BUILD_SUCCESS") {

      record.status = "COMPLETE";

      console.log(
        `[RepairCoordinator] BUILD_SUCCESS on attempt ${attempt}: ${projectId}`
      );

      return {
        success:        true,
        status:         "BUILD_SUCCESS",
        projectId,
        attempt,
        attemptsUsed:   record.attempts,
        attemptsRemaining: this.maxAttempts - record.attempts,
        verifyResult
      };

    }


    // BUILD_FAILED or any other failure from the verification layer

    const attemptsRemaining = this.maxAttempts - record.attempts;
    record.status = attemptsRemaining > 0 ? "RETRY_AVAILABLE" : "MAX_ATTEMPTS_REACHED";

    console.log(
      `[RepairCoordinator] BUILD_FAILED on attempt ${attempt}: ${projectId} ` +
      `(remaining=${attemptsRemaining})`
    );

    return {
      success:           false,
      status:            record.status === "MAX_ATTEMPTS_REACHED"
                           ? "MAX_ATTEMPTS_REACHED"
                           : "BUILD_FAILED",
      projectId,
      attempt,
      attemptsUsed:      record.attempts,
      attemptsRemaining,
      error:             verifyResult.error || "Build failed after patch",
      verifyResult
    };

  }


  // ── getHistory ────────────────────────────────────────────────────────────
  //
  // Return the full repair record for a project, or null if not found.
  //
  // @param  {string} projectId
  // @returns {{ projectId, attempts, status, history }|null}

  getHistory(projectId) {

    return this.history.get(projectId) || null;

  }


  // ── reset ─────────────────────────────────────────────────────────────────
  //
  // Clear the repair record for a project, resetting attempt count to zero.
  // Useful after a successful manual debug + patch cycle.
  //
  // @param  {string} projectId
  // @returns {{ success: boolean, projectId: string }}

  reset(projectId) {

    this.history.delete(projectId);

    console.log(`[RepairCoordinator] Record reset: ${projectId}`);

    return { success: true, projectId };

  }

}


export default RepairCoordinator;
