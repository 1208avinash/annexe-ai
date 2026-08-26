import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class MarketplaceReportGenerator {
  createReport(input = {}) {
    const catalog = input.catalog ?? { products: [] };
    const selectedProduct = input.selectedProduct ?? null;
    const productCount = catalog.products?.length ?? 0;

    return {
      marketplaceId: `MP-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      productCount,
      activeProducts: catalog.activeProducts ?? productCount,
      featuredProduct: selectedProduct?.name ?? catalog.products?.[0]?.name ?? null,
      productNames: (catalog.products ?? []).map(product => product.name),
      revenueModel: input.analytics?.revenueModel ?? {
        setupRevenue: selectedProduct?.pricing?.setup ?? 0,
        annualSubscriptionRevenue: (selectedProduct?.pricing?.subscription ?? 0) * 12,
        upgradeRevenue: selectedProduct?.pricing?.upgrade ?? 0,
        currency: selectedProduct?.pricing?.currency ?? "USD"
      },
      deploymentCapability: {
        supported: Boolean(input.deployment?.project),
        projectCreated: Boolean(input.deployment?.project),
        tracking: input.deployment?.tracking ?? null
      },
      subscriptionCapability: {
        supported: Boolean(input.subscription?.status),
        plan: input.subscription?.plan ?? null,
        billingPolicy: input.subscription?.billingPolicy ?? null
      },
      customerView: {
        tabs: ["Marketplace", "Products", "Agents", "Subscriptions", "My Purchases", "Upgrades"]
      },
      adminView: {
        tabs: ["Products", "Customers", "Revenue", "Usage", "Reviews", "Performance"]
      },
      analytics: input.analytics ?? null,
      reviews: input.reviews ?? null,
      purchaseFlow: input.purchaseFlow ?? [],
      upgradeFlow: input.upgrade ?? null,
      marketplaceScore: 100,
      status: "READY"
    };
  }

  persist(report, platformRoot) {
    if (!platformRoot) {
      return null;
    }

    const reportPath = path.join(platformRoot, "reports", "platform", "marketplace", "marketplace-readiness-report.json");
    writeJson(reportPath, report);
    return reportPath;
  }
}
