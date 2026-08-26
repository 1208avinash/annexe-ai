export default class ProductAnalyticsService {
  build(input = {}) {
    const catalog = input.catalog ?? { products: [] };
    const selectedProduct = input.selectedProduct ?? null;
    const subscription = input.subscription ?? {};
    const deployment = input.deployment ?? {};
    const purchaseCount = selectedProduct ? 1 : 0;
    const revenueModel = selectedProduct
      ? {
          setupRevenue: selectedProduct.pricing?.setup ?? 0,
          annualSubscriptionRevenue: (selectedProduct.pricing?.subscription ?? 0) * 12,
          upgradeRevenue: selectedProduct.pricing?.upgrade ?? 0,
          currency: selectedProduct.pricing?.currency ?? "USD"
        }
      : {
          setupRevenue: 0,
          annualSubscriptionRevenue: 0,
          upgradeRevenue: 0,
          currency: "USD"
        };

    return {
      analyticsId: `AN-${Date.now()}`,
      productViews: (catalog.products?.length ?? 0) * 15,
      purchases: purchaseCount,
      activeCustomers: purchaseCount > 0 ? 1 : 0,
      subscriptions: subscription.status === "ACTIVE" ? 1 : 0,
      upgrades: deployment.project ? 1 : 0,
      revenue: revenueModel.setupRevenue + revenueModel.annualSubscriptionRevenue + revenueModel.upgradeRevenue,
      revenueModel,
      usageInsights: [
        "Catalog browsing",
        "Purchase conversion",
        "Subscription adoption",
        "Upgrade demand",
        "Customer lifetime value"
      ]
    };
  }
}
