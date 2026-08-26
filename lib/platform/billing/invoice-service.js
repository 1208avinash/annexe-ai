import crypto from "crypto";

function splitMilestones(totalAmount) {
  const advanceAmount = Math.round(Number(totalAmount ?? 0) * 0.5);
  const completionAmount = Math.max(0, Number(totalAmount ?? 0) - advanceAmount);
  return { advanceAmount, completionAmount };
}

export default class InvoiceService {
  createInvoice({
    projectId,
    organizationId,
    totalAmount = 0,
    currency = "USD",
    description = "ANNEXE AI project invoice"
  } = {}) {
    const milestones = splitMilestones(totalAmount);
    return {
      invoiceId: `INV-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      projectId,
      organizationId,
      currency,
      totalAmount: Number(totalAmount) || 0,
      description,
      status: "open",
      milestones: [
        { name: "advance", amount: milestones.advanceAmount, percent: 50 },
        { name: "completion", amount: milestones.completionAmount, percent: 50 }
      ],
      createdAt: new Date().toISOString()
    };
  }
}
