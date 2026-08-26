export default class ProductSubscriptionService {
  build(input = {}) {
    const selectedProduct = input.selectedProduct ?? null;
    const pricing = selectedProduct?.pricing ?? {};

    return {
      subscriptionId: `SUB-${Date.now()}`,
      productId: selectedProduct?.id ?? null,
      status: selectedProduct ? "ACTIVE" : "PENDING",
      plan: {
        setup: pricing.setup ?? 0,
        monthly: pricing.subscription ?? 0,
        upgrade: pricing.upgrade ?? 0,
        currency: pricing.currency ?? "USD",
        billingModel: "One-time purchase + subscription + upgrade"
      },
      subscriptionOptions: [
        "One time purchase",
        "Monthly subscription",
        "Upgrade plan"
      ],
      billingPolicy: {
        advancePayment: 50,
        completionPayment: 50
      },
      renewal: {
        cadence: "Monthly",
        autoRenew: true
      }
    };
  }
}
