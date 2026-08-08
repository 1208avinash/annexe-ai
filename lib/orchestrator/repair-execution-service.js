// ── ANNEXE AI — Repair Execution Service ─────────────────────────────────────
//
// Phase 7.2
//
// Orchestration layer between Approval Service and Patch Executor.
//
// Single responsibility:
//   Confirm a repair is APPROVED, then delegate file application
//   to PatchExecutor.  Nothing else.
//
// Does NOT:
//   - Call the execution worker
//   - Rebuild the project
//   - Modify the debug worker
//   - Bypass or auto-approve anything
//
// Dependency injection:
//   Pass patchExecutor and approvalService via constructor.
//   If omitted, internal instances are created automatically.
//
// ─────────────────────────────────────────────────────────────────────────────

import { PatchExecutor }   from "./patch-executor.js";
import { DebugApprovalService } from "./debug-approval-service.js";


// ── RepairExecutionService ────────────────────────────────────────────────────

export class RepairExecutionService {

  /**
   * @param {object}          [options]
   * @param {PatchExecutor}   [options.patchExecutor]   - Injected patch executor.
   * @param {ApprovalService} [options.approvalService] - Injected approval service.
   *
   * Creates internal instances for either dependency if omitted.
   */
  constructor({ patchExecutor, approvalService } = {}) {

    this._patchExecutor   = patchExecutor   || new PatchExecutor();
    this._approvalService = approvalService || new DebugApprovalService();

  }


  // ── executeRepair ──────────────────────────────────────────────────────────
  //
  // Verify approval, then apply the patch plan to the sandbox.
  //
  // @param {object}   input
  // @param {string}   input.projectId  - Target project
  // @param {string}   input.debugId    - Approval record key (from debug worker)
  // @param {object[]} input.patchPlan  - Array of patch entries
  //
  // @returns {Promise<object>} Result contract

  async executeRepair(input = {}) {

    const { projectId, debugId, patchPlan } = input;


    // ── 1. Validate inputs ────────────────────────────────────────────────────

    if (!projectId) {
      return {
        success: false,
        error:   "projectId is required"
      };
    }

    if (!debugId) {
      return {
        success: false,
        error:   "debugId is required"
      };
    }

    if (!Array.isArray(patchPlan)) {
      return {
        success: false,
        error:   "patchPlan must be an array"
      };
    }


    // ── 2. Verify approval ────────────────────────────────────────────────────

    const record = this._approvalService.get(debugId);

    if (!record) {
      return {
        success: false,
        error:   `No approval record found for debugId: ${debugId}`
      };
    }

    if (record.status !== "APPROVED") {
      return {
        success: false,
        error:   `Repair is not approved — current status: ${record.status}`
      };
    }


    // ── 3. Apply patches ──────────────────────────────────────────────────────

    let patchResult;

    try {

      patchResult = await this._patchExecutor.applyPatch({
        projectId,
        patchPlan
      });

    } catch (err) {

      return {
        success: false,
        error:   `PatchExecutor threw unexpectedly: ${err instanceof Error ? err.message : String(err)}`
      };

    }

    if (!patchResult.success) {
      return {
        success: false,
        error:   patchResult.error || "Patch application failed"
      };
    }


    // ── 4. Return success ─────────────────────────────────────────────────────

    return {
      success:     true,
      projectId,
      debugId,
      status:      "PATCH_APPLIED",
      patchResult
    };

  }

}


export default RepairExecutionService;
