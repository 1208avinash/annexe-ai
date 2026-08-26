import fs from "fs";
import path from "path";

import PartnerOrchestrator from "./partners/partner-orchestrator.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function reserveRoot(baseName, workspaceRoot) {
  const candidate = path.resolve(workspaceRoot, baseName);
  ensureDir(candidate);
  return candidate;
}

export async function runPartnerPlatform({
  workspaceRoot = "workspace",
  marketplaceResult = null,
  productionResult = null,
  enterpriseResult = null,
  commandCenterResult = null,
  customerQuestion = "How is the partner ecosystem performing?"
} = {}) {
  const platformRoot = reserveRoot("partner-platform", workspaceRoot);
  const orchestrator = new PartnerOrchestrator();
  const partnerPlatform = orchestrator.build({
    requestText: customerQuestion,
    products: marketplaceResult?.marketplace?.catalog?.products
      ?? marketplaceResult?.marketplace?.productManager?.recommendedProducts
      ?? [],
    companyName: marketplaceResult?.marketplace?.report?.featuredProduct
      ?? productionResult?.commercialPlatform?.company?.analysis?.projectName
      ?? enterpriseResult?.productionPlatform?.commercialPlatform?.company?.analysis?.projectName
      ?? "ANNEXE AI",
    productionResult,
    enterpriseResult,
    commandCenterResult,
    marketplaceResult
  });

  const report = {
    generatedAt: new Date().toISOString(),
    platformRoot,
    partnerCount: partnerPlatform.report.partnerCount,
    customersManaged: partnerPlatform.report.customersManaged,
    revenueGenerated: partnerPlatform.report.revenueGenerated,
    commissionStatus: partnerPlatform.report.commissionStatus,
    whiteLabelReadiness: partnerPlatform.report.whiteLabelReadiness,
    ecosystemScore: partnerPlatform.report.ecosystemScore,
    dashboardSections: partnerPlatform.report.dashboardSections,
    partnerNames: partnerPlatform.report.partnerNames,
    status: partnerPlatform.report.status
  };

  const reportPath = orchestrator.persist(report, platformRoot);

  return {
    success: true,
    platformRoot,
    partnerPlatform,
    report,
    reportPath
  };
}
