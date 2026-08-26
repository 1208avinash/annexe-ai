import fs from "fs";
import path from "path";
import assert from "assert/strict";

import { runProductionSaaSPlatform } from "./lib/platform/production-saas-platform.js";
import { runEnterpriseScalingPlatform } from "./lib/platform/enterprise-scaling-platform.js";
import { runCommandCenterPlatform } from "./lib/platform/command-center-platform.js";
import { runMarketplacePlatform } from "./lib/platform/marketplace-platform.js";
import { runPartnerPlatform } from "./lib/platform/partner-platform.js";

const workspaceRoot = path.resolve("workspace", "partner-platform-test");
fs.rmSync(workspaceRoot, { recursive: true, force: true });

const productionResult = await runProductionSaaSPlatform({
  workspaceRoot: path.join(workspaceRoot, "production"),
  requestText: "Create a production-ready SaaS platform with billing and realtime operations.",
  includeCommercialPlatform: true
});

const enterpriseResult = await runEnterpriseScalingPlatform({
  workspaceRoot: path.join(workspaceRoot, "enterprise"),
  requestText: "Scale ANNEXE AI for enterprise customers.",
  includeProductionPlatform: false,
  productionResult
});

const commandCenterResult = await runCommandCenterPlatform({
  workspaceRoot: path.join(workspaceRoot, "command-center"),
  productionResult,
  enterpriseResult,
  customerQuestion: "How is partner revenue performing?"
});

const marketplaceResult = await runMarketplacePlatform({
  workspaceRoot: path.join(workspaceRoot, "marketplace"),
  requestText: "Launch the ANNEXE AI marketplace.",
  productionResult,
  enterpriseResult,
  commandCenterResult
});

const partnerResult = await runPartnerPlatform({
  workspaceRoot: path.join(workspaceRoot, "partner"),
  marketplaceResult,
  productionResult,
  enterpriseResult,
  commandCenterResult,
  customerQuestion: "Create a partner ecosystem for agencies."
});

const reportPath = partnerResult.reportPath;
assert.ok(fs.existsSync(reportPath), "Partner report should exist.");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
assert.ok(report.partnerCount >= 1, "Partner count should be at least one.");
assert.ok(report.customersManaged >= 1, "Partners should manage customers.");
assert.ok(report.revenueGenerated >= 0, "Revenue should be reported.");
assert.equal(report.ecosystemScore, 100);
assert.equal(report.whiteLabelReadiness, 100);
assert.equal(report.status, "READY");
assert.ok(Array.isArray(report.dashboardSections) && report.dashboardSections.includes("Brand Settings"));
assert.ok(Array.isArray(report.partnerNames) && report.partnerNames.length >= 1);

console.log(JSON.stringify({
  status: "PASS",
  ecosystemScore: report.ecosystemScore,
  reportPath,
  partnerCount: report.partnerCount,
  customersManaged: report.customersManaged,
  revenueGenerated: report.revenueGenerated,
  commissionStatus: report.commissionStatus,
  whiteLabelReadiness: report.whiteLabelReadiness,
  partnerNames: report.partnerNames,
  commandCenterStatus: commandCenterResult.report.status,
  marketplaceScore: marketplaceResult.report.marketplaceScore
}, null, 2));
