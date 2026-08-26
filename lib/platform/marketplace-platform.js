import fs from "fs";
import path from "path";

import MarketplaceOrchestrator from "./marketplace/marketplace-orchestrator.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function reserveRoot(baseName, workspaceRoot) {
  const candidate = path.resolve(workspaceRoot, baseName);
  ensureDir(candidate);
  return candidate;
}

export async function runMarketplacePlatform({
  workspaceRoot = "workspace",
  requestText = "Launch the ANNEXE AI marketplace.",
  productionResult = null,
  enterpriseResult = null,
  commandCenterResult = null,
  commercialResult = null,
  customerReview = null
} = {}) {
  const platformRoot = reserveRoot("marketplace-platform", workspaceRoot);
  const orchestrator = new MarketplaceOrchestrator();
  const marketplace = orchestrator.build({
    workspaceRoot: platformRoot,
    requestText,
    company: productionResult?.commercialPlatform?.company
      ?? enterpriseResult?.productionPlatform?.company
      ?? commercialResult?.company
      ?? commandCenterResult?.customerCommandCenter?.projectCommandCenter?.company
      ?? productionResult?.productionReport?.company
      ?? {},
    productionPlatform: productionResult,
    enterprisePlatform: enterpriseResult,
    commandCenter: commandCenterResult,
    commercialPlatform: commercialResult,
    customerReview
  });

  const report = {
    generatedAt: new Date().toISOString(),
    platformRoot,
    marketplaceScore: marketplace.report.marketplaceScore,
    productCount: marketplace.report.productCount,
    activeProducts: marketplace.report.activeProducts,
    revenueModel: marketplace.report.revenueModel,
    deploymentCapability: marketplace.report.deploymentCapability,
    subscriptionCapability: marketplace.report.subscriptionCapability,
    customerView: marketplace.report.customerView,
    adminView: marketplace.report.adminView,
    productNames: marketplace.report.productNames,
    analytics: marketplace.report.analytics,
    reviews: marketplace.report.reviews,
    purchaseFlow: marketplace.report.purchaseFlow,
    upgradeFlow: marketplace.report.upgradeFlow,
    status: marketplace.report.status
  };

  const reportPath = orchestrator.persist(report, platformRoot);

  return {
    success: true,
    platformRoot,
    marketplace,
    report,
    reportPath
  };
}
