// ── ANNEXE AI — Approval Execution Service ───────────────────────────────────
//
// Phase 8.2.1
//
// Single responsibility:
//   Gate RepairCoordinator behind the approval record.
//   An approved debugId is the only valid entry point into repair execution.
//
// Why this layer exists:
//   RepairCoordinator must never be called directly by the UI.
//   This service enforces the rule: approval first, then repair.
//
// Flow:
//   UI calls executeApprovedRepair({ debugId })
//         ↓
//   Load record from DebugApprovalService
//         ↓
//   Require status === "APPROVED"
//         ↓
//   Extract projectId + patchPlan from record
//         ↓
//   RepairCoordinator.repair(...)
//         ↓
//   Return repair result unchanged
//
// Does NOT:
//   - Approve records automatically
//   - Retry on failure
//   - Modify approval records
//   - Generate new patch plans
//   - Call DebugWorker
//   - Call PatchExecutor directly
//   - Call RebuildVerificationService directly
//
// ─────────────────────────────────────────────────────────────────────────────

import { DebugApprovalService } from "./debug-approval-service.js";
import { RepairCoordinator }    from "./repair-coordinator.js";


// ── ApprovalExecutionService ──────────────────────────────────────────────────

export class ApprovalExecutionService {

  /**
   * @param {object}               [options]
   * @param {DebugApprovalService} [options.debugApprovalService] - Injected approval service.
   * @param {RepairCoordinator}    [options.repairCoordinator]    - Injected repair coordinator.
   *
   * Creates internal instances for any omitted dependency.
   */
  constructor({
    debugApprovalService = null,
    repairCoordinator    = null
  } = {}) {

    this._approvalService    = debugApprovalService || new DebugApprovalService();
    this._repairCoordinator  = repairCoordinator    || new RepairCoordinator();

  }


  // ── executeApprovedRepair ─────────────────────────────────────────────────
  //
  // Entry point for the UI approval → repair flow.
  // Validates the approval record, then delegates to RepairCoordinator.
  //
  // @param {object} input
  // @param {string} input.debugId - Approval record key (required)
  //
  // Additional fields forwarded to RepairCoordinator.repair() if provided:
  //   technology, generatedFiles, cwd, buildReport
  //
  // @returns {Promise<object>} Repair result or guard failure

  async executeApprovedRepair({
    debugId,
    technology,
    generatedFiles,
    cwd,
    buildReport
  } = {}) {


    // ── 1. Validate debugId ───────────────────────────────────────────────────

    if (!debugId) {
      return {
        success: false,
        status:  "NOT_FOUND",
        error:   "debugId is required"
      };
    }


    // ── 2. Load approval record ───────────────────────────────────────────────

    const record = this._approvalService.get(debugId);

    if (!record) {
      console.log(
        `[ApprovalExecutionService] Record not found: ${debugId}`
      );
      return {
        success: false,
        status:  "NOT_FOUND",
        error:   `No approval record found for debugId: ${debugId}`
      };
    }


    // ── 3. Require APPROVED status ────────────────────────────────────────────

    if (record.status !== "APPROVED") {
      console.log(
        `[ApprovalExecutionService] Not approved: ${debugId} (status=${record.status})`
      );
      return {
        success: false,
        status:  "NOT_APPROVED",
        error:   `Record is not approved — current status: ${record.status}`,
        current: record.status
      };
    }


    // ── 4. Extract projectId + patchPlan from record ──────────────────────────

    const { projectId, patchPlan } = record;

    console.log(
      `[ApprovalExecutionService] Executing approved repair: ${debugId} → project=${projectId}`
    );


    // ── 5. Delegate to RepairCoordinator ──────────────────────────────────────
    //
    // Pass the record's patchPlan and projectId.
    // Forward any caller-supplied execution context unchanged.
    // Return the repair result exactly as received — no reshaping.

    const repairResult = await this._repairCoordinator.repair({
      projectId,
      debugId,
      patchPlan:      patchPlan      || [],
      technology:     technology     || null,
      generatedFiles: generatedFiles || [],
      cwd:            cwd            || null,
      buildReport:    buildReport    || null
    });

    return repairResult;

  }

}


export default ApprovalExecutionService;
