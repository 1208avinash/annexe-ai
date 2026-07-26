// ── ANNEXE AI — Payment Gate Schema ──────────────────────────────────────────
//
// Factory function for a payment gate record.
// Controls development unlock state — no payment gateway, no database.
//
// Consumed by:  api/agents/payment/gate.js
// Read by:      api/projects/create.js  (Phase 2.6+)
//
// Gate states:
//   "pending"            — gate created, proposal not yet reviewed
//   "awaiting_approval"  — proposal sent to client, no response yet
//   "payment_pending"    — client approved, advance payment outstanding
//   "approved"           — advance received, development unlocked
//   "rejected"           — client rejected proposal
//   "cancelled"          — project cancelled
//
// ─────────────────────────────────────────────────────────────────────────────


/**
 * createPaymentGate
 *
 * @param {object} data - Seed values (all optional)
 * @returns {object}    - Complete payment gate record
 */
export function createPaymentGate(data = {}) {

  const now = new Date().toISOString();

  return {

    // ── Identity ──────────────────────────────────────────────────────────────

    paymentId:   data.paymentId   || "PAY-" + Date.now(),
    projectId:   data.projectId   || null,
    proposalId:  data.proposalId  || null,


    // ── Gate state ────────────────────────────────────────────────────────────

    status: data.status || "pending",


    // ── Approval ──────────────────────────────────────────────────────────────

    proposalApproved: data.proposalApproved ?? false,


    // ── Advance payment requirements ──────────────────────────────────────────
    //
    // requiredAdvancePercentage: configurable — default 10%
    // requiredAdvanceAmount:     calculated from totalProjectCost × percentage
    // totalProjectCost:          from proposal.investment

    requiredAdvancePercentage: data.requiredAdvancePercentage ?? 10,
    requiredAdvanceAmount:     data.requiredAdvanceAmount     ?? 0,
    totalProjectCost:          data.totalProjectCost          ?? 0,
    currency:                  data.currency                  || "USD",


    // ── Payment state ─────────────────────────────────────────────────────────

    paymentReceived: data.paymentReceived ?? false,


    // ── Development lock ──────────────────────────────────────────────────────
    //
    // developmentUnlocked: master flag — false blocks all dev agents
    // unlockedAgents:      list of agent keys permitted to execute

    developmentUnlocked: data.developmentUnlocked ?? false,
    unlockedAgents:      data.unlockedAgents      || [],


    // ── Audit ─────────────────────────────────────────────────────────────────

    createdAt: data.createdAt || now,
    updatedAt: now

  };

}
