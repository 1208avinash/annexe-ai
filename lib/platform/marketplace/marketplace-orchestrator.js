import fs from "fs";
import path from "path";

import ProductCatalogService from "./catalog/product-catalog-service.js";
import ProductManager from "./products/product-manager.js";
import ProductDeploymentService from "./deployment/product-deployment-service.js";
import ProductSubscriptionService from "./subscription/product-subscription-service.js";
import ProductUpgradeService from "./upgrade/product-upgrade-service.js";
import ProductAnalyticsService from "./analytics/product-analytics-service.js";
import ProductReviewService from "./reviews/product-review-service.js";
import MarketplaceReportGenerator from "./reports/marketplace-report-generator.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class MarketplaceOrchestrator {
  constructor({
    productCatalogService = new ProductCatalogService(),
    productManager = new ProductManager(),
    productDeploymentService = new ProductDeploymentService(),
    productSubscriptionService = new ProductSubscriptionService(),
    productUpgradeService = new ProductUpgradeService(),
    productAnalyticsService = new ProductAnalyticsService(),
    productReviewService = new ProductReviewService(),
    marketplaceReportGenerator = new MarketplaceReportGenerator()
  } = {}) {
    this.productCatalogService = productCatalogService;
    this.productManager = productManager;
    this.productDeploymentService = productDeploymentService;
    this.productSubscriptionService = productSubscriptionService;
    this.productUpgradeService = productUpgradeService;
    this.productAnalyticsService = productAnalyticsService;
    this.productReviewService = productReviewService;
    this.marketplaceReportGenerator = marketplaceReportGenerator;
  }

  build(input = {}) {
    const catalog = this.productCatalogService.buildCatalog(input);
    const productManager = this.productManager.build({
      catalog,
      requestText: input.requestText,
      customerType: input.customerType
    });
    const deployment = this.productDeploymentService.build({
      selectedProduct: productManager.selectedProduct,
      company: input.company ?? {},
      workspaceRoot: input.workspaceRoot ?? null
    });
    const subscription = this.productSubscriptionService.build({
      selectedProduct: productManager.selectedProduct,
      deployment,
      company: input.company ?? {}
    });
    const upgrade = this.productUpgradeService.build({
      selectedProduct: productManager.selectedProduct,
      company: input.company ?? {}
    });
    const analytics = this.productAnalyticsService.build({
      catalog,
      selectedProduct: productManager.selectedProduct,
      deployment,
      subscription,
      upgrade
    });
    const reviews = this.productReviewService.build({
      selectedProduct: productManager.selectedProduct,
      customerReview: input.customerReview ?? null
    });
    const report = this.marketplaceReportGenerator.createReport({
      catalog,
      selectedProduct: productManager.selectedProduct,
      deployment,
      subscription,
      upgrade,
      analytics,
      reviews,
      purchaseFlow: productManager.purchaseFlow
    });

    return {
      catalog,
      productManager,
      deployment,
      subscription,
      upgrade,
      analytics,
      reviews,
      customerView: report.customerView,
      adminView: report.adminView,
      report
    };
  }

  persist(report, platformRoot) {
    if (!platformRoot) {
      return null;
    }

    ensureDir(path.join(platformRoot, "reports", "platform", "marketplace"));
    return this.marketplaceReportGenerator.persist(report, platformRoot);
  }
}
