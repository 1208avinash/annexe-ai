// ── ANNEXE AI — Payment Gate Agent ───────────────────────────────────────────
//
// Controls development unlock state based on proposal approval and payment.
// Fully deterministic — no external APIs, no payment gateway, no database.
//
// Three-rule decision engine:
//
//   Rule 1 — Proposal not approved
//             → status: awaiting_approval
//             → development: locked
//
//   Rule 2 — Proposal approved, payment missing
//             → calculate required advance (default 10%)
//             → status: payment_pending
//             → development: locked
//
//   Rule 3 — Proposal approved + payment received
//             → status: approved
//             → development: unlocked
//             → agents: developer_agent, qa_agent, testing_agent
//
// Pipeline position:
//   Proposal Agent → [THIS] → Development Agents (if unlocked)
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Inlined: createPaymentGate (replaces ../../payment/schema.js) ────────────
function createPaymentGate(data = {}) {
  const now = new Date().toISOString();
  return {
    paymentId:                 data.paymentId                 || "PAY-" + Date.now(),
    projectId:                 data.projectId                 || null,
    proposalId:                data.proposalId                || null,
    status:                    data.status                    || "pending",
    proposalApproved:          data.proposalApproved          ?? false,
    requiredAdvancePercentage: data.requiredAdvancePercentage ?? 10,
    requiredAdvanceAmount:     data.requiredAdvanceAmount     ?? 0,
    totalProjectCost:          data.totalProjectCost          ?? 0,
    currency:                  data.currency                  || "USD",
    paymentReceived:           data.paymentReceived           ?? false,
    developmentUnlocked:       data.developmentUnlocked       ?? false,
    unlockedAgents:            data.unlockedAgents            || [],
    createdAt:                 data.createdAt                 || now,
    updatedAt:                 now
  };
}


// ── Constants ─────────────────────────────────────────────────────────────────

// Default advance percentage — easy to change for different pricing models
const DEFAULT_ADVANCE_PERCENTAGE = 10;

// Agents unlocked after payment approval
const DEVELOPMENT_AGENTS = [
  "developer_agent",
  "qa_agent",
  "testing_agent"
];


// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * calculateAdvanceAmount
 *
 * Rounds to nearest whole currency unit (no floating-point surprises).
 *
 * @param {number} totalCost
 * @param {number} percentage  0–100
 * @returns {number}
 */
function calculateAdvanceAmount(totalCost, percentage) {
  if (!totalCost || totalCost <= 0)       return 0;
  if (!percentage || percentage <= 0)     return 0;
  return Math.round((totalCost * percentage) / 100);
}

/**
 * resolveApprovalStatus
 *
 * Normalises truthy/string approval signals to a boolean.
 * Accepts: true, "approved", "yes", "accepted", 1
 */
function resolveApprovalStatus(approvalStatus) {
  if (typeof approvalStatus === "boolean") return approvalStatus;
  if (typeof approvalStatus === "string") {
    return ["approved", "yes", "accepted", "true", "1"]
      .includes(approvalStatus.toLowerCase().trim());
  }
  return Boolean(approvalStatus);
}

/**
 * resolvePaymentStatus
 *
 * Normalises truthy/string payment signals to a boolean.
 * Accepts: true, "received", "paid", "confirmed", "yes", 1
 */
function resolvePaymentStatus(paymentStatus) {
  if (typeof paymentStatus === "boolean") return paymentStatus;
  if (typeof paymentStatus === "string") {
    return ["received", "paid", "confirmed", "yes", "true", "1"]
      .includes(paymentStatus.toLowerCase().trim());
  }
  return Boolean(paymentStatus);
}


// ── Main exported agent function ──────────────────────────────────────────────

/**
 * runPaymentGateAgent
 *
 * @param {object} input
 * @param {object} input.proposal        - Output from runProposalAgent().proposal
 * @param {*}      input.approvalStatus  - Client approval signal (boolean / string)
 * @param {*}      input.paymentStatus   - Payment confirmation signal (boolean / string)
 * @param {string} [input.projectId]     - Parent project ID (optional)
 *
 * @returns {object} { success, agent, payment, action, reason }
 */
export function runPaymentGateAgent({
  proposal       = {},
  approvalStatus = false,
  paymentStatus  = false,
  projectId      = null
} = {}) {

  // ── Resolve inputs ────────────────────────────────────────────────────────

  const proposalApproved  = resolveApprovalStatus(approvalStatus);
  const paymentReceived   = resolvePaymentStatus(paymentStatus);

  const totalProjectCost  = proposal?.investment  || 0;
  const currency          = proposal?.currency    || "USD";
  const proposalId        = proposal?.proposalId  || null;

  const advancePercentage = DEFAULT_ADVANCE_PERCENTAGE;
  const advanceAmount     = calculateAdvanceAmount(totalProjectCost, advancePercentage);


  // ── Rule 1: Proposal not approved ────────────────────────────────────────

  if (!proposalApproved) {
    const payment = createPaymentGate({
      projectId,
      proposalId,

      status:                    "awaiting_approval",
      proposalApproved:          false,

      requiredAdvancePercentage: advancePercentage,
      requiredAdvanceAmount:     advanceAmount,
      totalProjectCost,
      currency,

      paymentReceived:           false,
      developmentUnlocked:       false,
      unlockedAgents:            []
    });

    return {
      success: true,
      agent:   "payment_gate_agent",
      version: "1.0.0",
      payment,
      action:  "Client approval required",
      reason:  "Proposal has not been approved by the client. Development is locked until approval is received."
    };
  }


  // ── Rule 2: Approved but payment missing ──────────────────────────────────

  if (proposalApproved && !paymentReceived) {
    const payment = createPaymentGate({
      projectId,
      proposalId,

      status:                    "payment_pending",
      proposalApproved:          true,

      requiredAdvancePercentage: advancePercentage,
      requiredAdvanceAmount:     advanceAmount,
      totalProjectCost,
      currency,

      paymentReceived:           false,
      developmentUnlocked:       false,
      unlockedAgents:            []
    });

    return {
      success: true,
      agent:   "payment_gate_agent",
      version: "1.0.0",
      payment,
      action:  "Awaiting advance payment",
      reason:  `Proposal approved. Development begins after ${advancePercentage}% advance payment of ${currency} ${advanceAmount.toLocaleString()} is received.`
    };
  }


  // ── Rule 3: Approved + payment received → unlock ──────────────────────────

  const payment = createPaymentGate({
    projectId,
    proposalId,

    status:                    "approved",
    proposalApproved:          true,

    requiredAdvancePercentage: advancePercentage,
    requiredAdvanceAmount:     advanceAmount,
    totalProjectCost,
    currency,

    paymentReceived:           true,
    developmentUnlocked:       true,
    unlockedAgents:            [...DEVELOPMENT_AGENTS]
  });

  return {
    success: true,
    agent:   "payment_gate_agent",
    version: "1.0.0",
    payment,
    action:  "Development unlocked",
    reason:  `Advance payment of ${currency} ${advanceAmount.toLocaleString()} confirmed. Development agents are now active.`
  };

}


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { proposal, approvalStatus, paymentStatus, projectId } = req.body || {};

    if (!proposal) {
      return res.status(400).json({ error: "proposal object is required" });
    }

    const result = runPaymentGateAgent({
      proposal,
      approvalStatus,
      paymentStatus,
      projectId
    });

    return res.status(200).json(result);

  } catch (error) {

    console.error("PAYMENT GATE AGENT ERROR:", error);

    return res.status(500).json({ error: "Payment gate evaluation failed" });

  }

}
