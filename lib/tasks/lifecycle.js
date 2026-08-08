// ── ANNEXE AI — Task Lifecycle Manager ───────────────────────────────────────
//
// Defines all valid task statuses and the allowed transition graph.
// Any status move must pass through validateTransition() — this is the
// single source of truth for task state machine rules.
// ─────────────────────────────────────────────────────────────────────────────


// ── Status constants ──────────────────────────────────────────────────────────

export const STATUSES = Object.freeze({
  CREATED:  "CREATED",
  READY:    "READY",
  ASSIGNED: "ASSIGNED",
  CODING:   "CODING",
  TESTING:  "TESTING",
  REVIEW:   "REVIEW",
  APPROVED: "APPROVED",
  MERGED:   "MERGED",
  FAILED:   "FAILED"
});


// ── Transition graph ──────────────────────────────────────────────────────────
//
// Maps each status to the set of statuses it is permitted to move to.
// FAILED is reachable from any active state (handled separately below).

const TRANSITIONS = new Map([
  [STATUSES.CREATED,  new Set([STATUSES.READY])],
  [STATUSES.READY,    new Set([STATUSES.ASSIGNED])],
  [STATUSES.ASSIGNED, new Set([STATUSES.CODING])],
  [STATUSES.CODING,   new Set([STATUSES.TESTING,  STATUSES.FAILED])],
  [STATUSES.TESTING,  new Set([STATUSES.REVIEW,   STATUSES.FAILED])],
  [STATUSES.REVIEW,   new Set([STATUSES.APPROVED, STATUSES.FAILED])],
  [STATUSES.APPROVED, new Set([STATUSES.MERGED])],
  [STATUSES.MERGED,   new Set()],   // terminal — no further transitions
  [STATUSES.FAILED,   new Set()]    // terminal — no further transitions
]);

// Active statuses from which FAILED is always reachable
const FAILABLE_STATUSES = new Set([
  STATUSES.READY,
  STATUSES.ASSIGNED,
  STATUSES.CODING,
  STATUSES.TESTING,
  STATUSES.REVIEW
]);


/**
 * validateTransition
 *
 * Returns true if moving from currentStatus to newStatus is permitted.
 *
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
export function validateTransition(currentStatus, newStatus) {

  if (!currentStatus || !newStatus) return false;

  // Normalise to uppercase for tolerance
  const current = currentStatus.toUpperCase();
  const next    = newStatus.toUpperCase();

  // FAILED is reachable from any active (non-terminal) state
  if (next === STATUSES.FAILED && FAILABLE_STATUSES.has(current)) return true;

  const allowed = TRANSITIONS.get(current);
  if (!allowed) return false;

  return allowed.has(next);
}


/**
 * getAllowedTransitions
 *
 * Returns the list of statuses a task may move to from its current state.
 * Useful for UI and agent decision-making.
 *
 * @param {string} currentStatus
 * @returns {string[]}
 */
export function getAllowedTransitions(currentStatus) {

  if (!currentStatus) return [];

  const current = currentStatus.toUpperCase();
  const allowed = TRANSITIONS.get(current);
  if (!allowed) return [];

  const result = [...allowed];

  // Always surface FAILED as an option from active states
  if (FAILABLE_STATUSES.has(current) && !result.includes(STATUSES.FAILED)) {
    result.push(STATUSES.FAILED);
  }

  return result;
}


/**
 * isTerminal
 *
 * Returns true if the status has no further allowed transitions.
 *
 * @param {string} status
 * @returns {boolean}
 */
export function isTerminal(status) {
  if (!status) return false;
  const norm    = status.toUpperCase();
  const allowed = TRANSITIONS.get(norm);
  return allowed !== undefined && allowed.size === 0;
}