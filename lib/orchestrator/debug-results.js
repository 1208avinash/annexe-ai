/*
  ANNEXE AI — Debug Results Store
  FILE: api/orchestrator/debug-results.js

  DebugResultsManager
  In-memory store for Debug Worker diagnosis and patch proposals.
  Holds records in PENDING_APPROVAL state until ApprovalGate acts.

  No database. No filesystem writes. No patch execution.

  RECORD SHAPE:
  {
    debugId:   string,             — "DBG-<timestamp>-<counter>"
    projectId: string,
    status:    string,             — PENDING_APPROVAL | APPROVED | REJECTED
    diagnosis: object,             — from debug_worker
    patchPlan: array,              — from debug_worker
    createdAt: string,             — ISO timestamp
    updatedAt: string              — ISO timestamp
  }
*/


// ── Allowed status values ─────────────────────────────────────────────────────

const VALID_STATUSES = new Set([
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED"
]);


// ── ID counter — ensures uniqueness within a process lifetime ─────────────────

let _counter = 0;

function generateDebugId() {
  _counter += 1;
  return `DBG-${Date.now()}-${_counter}`;
}


// ── DebugResultsManager ───────────────────────────────────────────────────────

export class DebugResultsManager {


  constructor() {

    // debugId → record
    this._store = new Map();

  }


  /*
    createDebugResult(input)

    Accepts diagnosis and patchPlan from the Debug Worker.
    Stores a new record in PENDING_APPROVAL state.

    @param {object} input
    @param {string}   input.projectId  — required
    @param {object}   input.diagnosis  — required
    @param {Array}    input.patchPlan  — required

    @returns {{ success: true, debugId, status, record }
           |  { success: false, error }}
  */

  createDebugResult({
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


    // ── Build record ────────────────────────────────────────────────────────

    const debugId = generateDebugId();
    const now     = new Date().toISOString();

    const record = {
      debugId,
      projectId,
      status:    "PENDING_APPROVAL",
      diagnosis,
      patchPlan,
      createdAt: now,
      updatedAt: now
    };

    this._store.set(debugId, record);

    console.log(
      "ANNEXE DEBUG STORE — Record created:",
      debugId,
      projectId
    );

    return {
      success: true,
      debugId,
      status:  "PENDING_APPROVAL",
      record
    };

  }


  /*
    getDebugResult(debugId)

    Returns the stored record or null if not found.

    @param {string} debugId
    @returns {object|null}
  */

  getDebugResult(debugId) {

    return this._store.get(debugId) ?? null;

  }


  /*
    updateStatus(debugId, status)

    Transitions a record to a new status.
    Only PENDING_APPROVAL | APPROVED | REJECTED are accepted.

    @param {string} debugId
    @param {string} status

    @returns {{ success: true, debugId, status, record }
           |  { success: false, error }}
  */

  updateStatus(debugId, status) {

    // ── Validate status ─────────────────────────────────────────────────────

    if (!VALID_STATUSES.has(status)) {
      return {
        success: false,
        error:   `Invalid status '${status}'. Allowed: ${[...VALID_STATUSES].join(", ")}`
      };
    }


    // ── Find record ─────────────────────────────────────────────────────────

    const record = this._store.get(debugId);

    if (!record) {
      return {
        success: false,
        error:   `No debug record found for debugId '${debugId}'`
      };
    }


    // ── Apply update ────────────────────────────────────────────────────────

    record.status    = status;
    record.updatedAt = new Date().toISOString();

    console.log(
      "ANNEXE DEBUG STORE — Status updated:",
      debugId,
      status
    );

    return {
      success: true,
      debugId,
      status,
      record
    };

  }


  /*
    getAll()

    Returns all stored debug records as an array.
    Ordered by insertion (Map preserves insertion order).

    @returns {object[]}
  */

  getAll() {

    return [...this._store.values()];

  }

}


export default DebugResultsManager;
