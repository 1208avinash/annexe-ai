/*
  ANNEXE AI — Debug Approval Service
  FILE: api/orchestrator/debug-approval-service.js

  DebugApprovalService
  Service layer connecting DebugResultsManager to ApprovalGate.
  Manages approval state transitions for stored debug repair cases.

  V1 CONTRACT:
  - No patch execution
  - No file modification
  - No patcher calls
  - In-memory only

  FLOW:
    Debug Worker output
          ↓
    submitForApproval()   → DebugResultsManager (PENDING_APPROVAL)
          ↓
    approve() / reject()  → ApprovalGate → DebugResultsManager (APPROVED / REJECTED)
          ↓
    Future Patch Executor (Phase 6.6+)
*/


import { DebugResultsManager } from "../../debug-results.js";
import { ApprovalGate }        from "../../approval-gate.js";


// ── DebugApprovalService ──────────────────────────────────────────────────────

export class DebugApprovalService {


  /*
    constructor

    Accepts injected instances for testability.
    Creates own instances if none provided.

    @param {object} [deps={}]
    @param {DebugResultsManager} [deps.debugResultsManager]
    @param {ApprovalGate}        [deps.approvalGate]
  */

  constructor({
    debugResultsManager = null,
    approvalGate        = null
  } = {}) {

    this.store = debugResultsManager || new DebugResultsManager();

    // ApprovalGate must share the same store instance so status
    // transitions are visible to both components.
    this.gate  = approvalGate || new ApprovalGate(this.store);

  }


  /*
    submitForApproval(input)

    Accepts Debug Worker output and stores it as a PENDING_APPROVAL record.

    @param {object} input
    @param {string}   input.projectId  — required
    @param {object}   input.diagnosis  — required
    @param {Array}    input.patchPlan  — required

    @returns {{ success: true,  debugId, status: "PENDING_APPROVAL" }
           |  { success: false, error }}
  */

  submitForApproval({
    projectId = null,
    diagnosis = null,
    patchPlan = null
  } = {}) {

    // ── Guards ──────────────────────────────────────────────────────────────

    if (!projectId) {
      return {
        success: false,
        error:   "projectId is required"
      };
    }

    if (!diagnosis || typeof diagnosis !== "object") {
      return {
        success: false,
        error:   "diagnosis is required and must be an object"
      };
    }

    if (!Array.isArray(patchPlan)) {
      return {
        success: false,
        error:   "patchPlan is required and must be an array"
      };
    }


    // ── Store record ────────────────────────────────────────────────────────

    const storeResult = this.store.createDebugResult({
      projectId,
      diagnosis,
      patchPlan
    });

    if (!storeResult.success) {
      return {
        success: false,
        error:   storeResult.error || "Failed to create debug result"
      };
    }

    console.log(
      "ANNEXE APPROVAL SERVICE — Submitted for approval:",
      storeResult.debugId,
      projectId
    );

    return {
      success: true,
      debugId: storeResult.debugId,
      status:  "PENDING_APPROVAL"
    };

  }


  /*
    approve(input)

    Approves a pending debug record.
    Delegates the decision to ApprovalGate, which updates the store.

    @param {object} input
    @param {string}   input.debugId  — required

    @returns {{ success: true,  debugId, status: "APPROVED" }
           |  { success: false, error }}
  */

  approve({
    debugId = null
  } = {}) {

    if (!debugId) {
      return {
        success: false,
        error:   "debugId is required"
      };
    }

    const gateResult = this.gate.approve({
      debugId,
      decision: "APPROVE"
    });

    if (!gateResult.success) {
      return {
        success: false,
        error:   gateResult.error
      };
    }

    console.log(
      "ANNEXE APPROVAL SERVICE — Approved:",
      debugId
    );

    return {
      success: true,
      debugId,
      status:  "APPROVED"
    };

  }


  /*
    reject(input)

    Rejects a pending debug record.
    Delegates the decision to ApprovalGate, which updates the store.

    @param {object} input
    @param {string}   input.debugId  — required

    @returns {{ success: true,  debugId, status: "REJECTED" }
           |  { success: false, error }}
  */

  reject({
    debugId = null
  } = {}) {

    if (!debugId) {
      return {
        success: false,
        error:   "debugId is required"
      };
    }

    const gateResult = this.gate.approve({
      debugId,
      decision: "REJECT"
    });

    if (!gateResult.success) {
      return {
        success: false,
        error:   gateResult.error
      };
    }

    console.log(
      "ANNEXE APPROVAL SERVICE — Rejected:",
      debugId
    );

    return {
      success: true,
      debugId,
      status:  "REJECTED"
    };

  }


  /*
    get(debugId)

    Returns the stored debug record or null if not found.

    @param {string} debugId
    @returns {object|null}
  */

  get(debugId) {

    if (!debugId) return null;

    return this.store.getDebugResult(debugId);

  }

}


export default DebugApprovalService;
