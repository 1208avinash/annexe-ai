import InvoiceService from "./invoice-service.js";
import PaymentGateway from "./payment-gateway.js";
import SubscriptionService from "./subscription-service.js";

export default class BillingService {
  constructor({
    databaseManager,
    invoiceService = new InvoiceService(),
    paymentGateway = new PaymentGateway(),
    subscriptionService = new SubscriptionService()
  } = {}) {
    this.databaseManager = databaseManager;
    this.invoiceService = invoiceService;
    this.paymentGateway = paymentGateway;
    this.subscriptionService = subscriptionService;
  }

  getInvoices() {
    return this.databaseManager.list("payments");
  }

  createProjectInvoice({ projectId, organizationId, totalAmount, currency, description } = {}) {
    const invoice = this.invoiceService.createInvoice({
      projectId,
      organizationId,
      totalAmount,
      currency,
      description
    });

    this.databaseManager.insert("payments", {
      projectId,
      organizationId,
      invoiceId: invoice.invoiceId,
      amount: invoice.totalAmount,
      currency: invoice.currency,
      status: "invoiced",
      milestone: "invoice",
      gateway: "invoice"
    });

    return invoice;
  }

  collectAdvancePayment({ projectId, organizationId, totalAmount, currency = "USD" } = {}) {
    const invoice = this.createProjectInvoice({
      projectId,
      organizationId,
      totalAmount,
      currency,
      description: "Advance payment for ANNEXE AI software delivery"
    });

    const payment = this.paymentGateway.processPayment({
      amount: invoice.milestones[0].amount,
      currency,
      source: "internal-ledger",
      metadata: {
        invoiceId: invoice.invoiceId,
        milestone: "advance"
      }
    });

    this.databaseManager.insert("payments", {
      projectId,
      organizationId,
      invoiceId: invoice.invoiceId,
      amount: payment.amount,
      currency,
      status: payment.status,
      milestone: "advance",
      gateway: payment.gateway
    });

    return {
      invoice,
      payment,
      gate: {
        requiredAdvancePercent: 50,
        approved: payment.status === "approved"
      }
    };
  }

  collectCompletionPayment({ projectId, organizationId, totalAmount, currency = "USD" } = {}) {
    const invoice = this.invoiceService.createInvoice({
      projectId,
      organizationId,
      totalAmount,
      currency,
      description: "Completion payment for ANNEXE AI software delivery"
    });

    const completionAmount = invoice.milestones[1].amount;
    const payment = this.paymentGateway.processPayment({
      amount: completionAmount,
      currency,
      source: "internal-ledger",
      metadata: {
        invoiceId: invoice.invoiceId,
        milestone: "completion"
      }
    });

    this.databaseManager.insert("payments", {
      projectId,
      organizationId,
      invoiceId: invoice.invoiceId,
      amount: payment.amount,
      currency,
      status: payment.status,
      milestone: "completion",
      gateway: payment.gateway
    });

    return {
      invoice,
      payment,
      gate: {
        requiredCompletionPercent: 50,
        approved: payment.status === "approved"
      }
    };
  }

  createSubscription(input = {}) {
    const subscription = this.subscriptionService.createSubscription(input);
    if (input.organizationId) {
      const existing = this.databaseManager.findById("organizations", input.organizationId);
      if (existing) {
        this.databaseManager.update("organizations", input.organizationId, {
          plan: subscription.plan,
          status: subscription.status
        });
      }
      else {
        this.databaseManager.insert("organizations", {
          id: input.organizationId,
          name: input.organizationName || "Organization",
          industry: input.industry || "Unknown",
          ownerUserId: input.ownerUserId || null,
          plan: subscription.plan,
          status: subscription.status
        });
      }
    }
    return subscription;
  }

  createUpgradeRequest({
    projectId,
    organizationId,
    title,
    description,
    estimate = 0
  } = {}) {
    const totalAmount = Number(estimate) || 0;
    const advanceAmount = Math.round(totalAmount * 0.5);
    const completionAmount = Math.max(0, totalAmount - advanceAmount);

    return this.databaseManager.insert("upgrades", {
      projectId,
      organizationId,
      title,
      description,
      status: "quote-generated",
      advancePercent: 50,
      completionPercent: 50,
      estimate: totalAmount,
      milestones: {
        advanceAmount,
        completionAmount
      }
    });
  }
}
