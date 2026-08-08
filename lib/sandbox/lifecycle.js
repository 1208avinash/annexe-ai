// ── ANNEXE AI — Sandbox Lifecycle ────────────────────────────────────────────
//
// Defines valid sandbox statuses and enforces allowed state transitions.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Status constants ──────────────────────────────────────────────────────────

export const STATUSES = Object.freeze({
  CREATED:      "CREATED",
  INITIALIZING: "INITIALIZING",
  READY:        "READY",
  ACTIVE:       "ACTIVE",
  TESTING:      "TESTING",
  LOCKED:       "LOCKED",
  DESTROYED:    "DESTROYED"
});


// ── Allowed transitions ───────────────────────────────────────────────────────
//
// Key   = current status
// Value = set of statuses that can be transitioned into from the key

const ALLOWED_TRANSITIONS = {

  [STATUSES.CREATED]:      new Set([STATUSES.INITIALIZING]),

  [STATUSES.INITIALIZING]: new Set([STATUSES.READY]),

  [STATUSES.READY]:        new Set([STATUSES.ACTIVE,  STATUSES.LOCKED]),

  [STATUSES.ACTIVE]:       new Set([STATUSES.TESTING, STATUSES.LOCKED]),

  [STATUSES.TESTING]:      new Set([STATUSES.LOCKED]),

  [STATUSES.LOCKED]:       new Set([STATUSES.DESTROYED]),

  // Terminal state — no outgoing transitions
  [STATUSES.DESTROYED]:    new Set()

};


// ── validateSandboxTransition ─────────────────────────────────────────────────

/**
 * Returns true when transitioning from currentStatus to newStatus is allowed.
 *
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
export function validateSandboxTransition(currentStatus, newStatus) {

  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed) {
    // Unknown current status — reject
    return false;
  }

  return allowed.has(newStatus);

}
