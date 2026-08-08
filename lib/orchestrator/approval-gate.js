/*
  ANNEXE AI — Approval Gate
  FILE: api/orchestrator/approval-gate.js

  ApprovalGate
  Receives human (or orchestrator) decisions on pending debug records.
  Updates DebugResultsManager and returns a structured approval outcome.

  V1 CONTRACT:
  - Input:  { debugId, decision }   decision: "APPROVE" | "REJECT"
  - Output: approval outcome object
  - No patch execution — approval only gates the state transition
  - No database. No filesystem writes.

  VALID DECISIONS:
    APPROVE  → status becomes "APPROVED",  approved: true
    REJECT   → status becomes "REJECTED",  approved: false
*/


import { DebugResultsManager } from "./debug-results.js";


// ── Allowed decisions ─────────────────────────────────────────────────────────

const VALID_DECISIONS = new Set(["APPROVE", "REJECT"]);

// Decision → target status
const DECISION_STATUS_MAP = {
  APPROVE: "APPROVED",
  REJECT:  "REJECTED"
};


// ── ApprovalGate ──────────────────────────────────────────────────────────────

export class ApprovalGate {


  constructor(debugResultsManager = null) {

    // Accept an injected store (for testing) or create own instance
    this.store = debugResultsManager || new DebugResultsManager();

  }


  /*
    approve(input)

    Processes a human decision on a pending debug record.

    @param {object} input
    @param {string}   input.debugId   — required; must exist in store
    @param {string}   input.decision  — "APPROVE" | "REJECT"

    @returns
      APPROVE:
      { success: true, debugId, approved: true,  status: "APPROVED"  }

      REJECT:
      { success: true, debugId, approved: false, status: "REJECTED"  }

      Invalid / not found:
      { success: false, error: string }
  */

  approve({
    debugId  = null,
    decision = null
  } = {}) {


    // ── Guard: debugId ──────────────────────────────────────────────────────

    if (!debugId) {
      return {
        success: false,
        error:   "debugId is required"
      };
    }


    // ── Guard: decision ─────────────────────────────────────────────────────

    if (!decision) {
      return {
        success: false,
        error:   "decision is required"
      };
    }

    const normalised = decision.toUpperCase();

    if (!VALID_DECISIONS.has(normalised)) {
      return {
        success: false,
        error:   `Invalid decision '${decision}'. Allowed: ${[...VALID_DECISIONS].join(", ")}`
      };
    }


    // ── Guard: record must exist ────────────────────────────────────────────

    const record = this.store.getDebugResult(debugId);

    if (!record) {
      return {
        success: false,
        error:   `No debug record found for debugId '${debugId}'`
      };
    }


    // ── Guard: only PENDING_APPROVAL records can be decided ─────────────────

    if (record.status !== "PENDING_APPROVAL") {
      return {
        success: false,
        error:   `Record '${debugId}' is already '${record.status}' — cannot re-decide`
      };
    }


    // ── Apply status transition ─────────────────────────────────────────────

    const targetStatus = DECISION_STATUS_MAP[normalised];

    const updateResult = this.store.updateStatus(debugId, targetStatus);

    if (!updateResult.success) {
      return {
        success: false,
        error:   updateResult.error
      };
    }


    // ── Build approval outcome ──────────────────────────────────────────────

    const approved = normalised === "APPROVE";

    console.log(
      "ANNEXE APPROVAL GATE —",
      approved ? "APPROVED" : "REJECTED",
      ":",
      debugId
    );

    return {
      success:  true,
      debugId,
      approved,
      status:   targetStatus
    };

  }

}


export default ApprovalGate;
