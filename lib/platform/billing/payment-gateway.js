import crypto from "crypto";

export default class PaymentGateway {
  processPayment({
    amount = 0,
    currency = "USD",
    source = "internal-ledger",
    metadata = {}
  } = {}) {
    const approved = Number(amount) > 0;

    return {
      paymentId: `PAY-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      status: approved ? "approved" : "declined",
      gateway: source,
      amount: Number(amount) || 0,
      currency,
      processedAt: new Date().toISOString(),
      metadata
    };
  }
}
