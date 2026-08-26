import fs from "fs";
import path from "path";
import assert from "assert/strict";

import { runProductionSaaSPlatform } from "./lib/platform/production-saas-platform.js";
import { runEnterpriseScalingPlatform } from "./lib/platform/enterprise-scaling-platform.js";
import { runCommandCenterPlatform } from "./lib/platform/command-center-platform.js";
import { runMarketplacePlatform } from "./lib/platform/marketplace-platform.js";

const workspaceRoot = path.resolve("workspace", "marketplace-platform-test");
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
  customerQuestion: "What is the marketplace status?"
});

const marketplaceResult = await runMarketplacePlatform({
  workspaceRoot: path.join(workspaceRoot, "marketplace"),
  requestText: "Build a marketplace for AI CRM and AI agents.",
  productionResult,
  enterpriseResult,
  commandCenterResult,
  customerReview: {
    rating: 5,
    feedback: "The marketplace makes purchase, deployment, and upgrades easy.",
    featureRequests: ["More agent bundles", "More industry templates"]
  }
});

const reportPath = marketplaceResult.reportPath;
assert.ok(fs.existsSync(reportPath), "Marketplace report should exist.");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
assert.ok(report.productCount >= 12, "Marketplace should include the initial product catalog.");
assert.ok(report.activeProducts >= 12, "Marketplace should keep all initial products active.");
assert.equal(report.marketplaceScore, 100);
assert.equal(report.deploymentCapability.supported, true);
assert.equal(report.subscriptionCapability.supported, true);
assert.ok(Array.isArray(report.customerView.tabs) && report.customerView.tabs.includes("Marketplace"));
assert.ok(Array.isArray(report.adminView.tabs) && report.adminView.tabs.includes("Revenue"));
assert.ok(Array.isArray(report.productNames) && report.productNames.includes("AI CRM Platform"));
assert.ok(Array.isArray(report.productNames) && report.productNames.includes("AI Sales Agent"));
assert.ok(Array.isArray(report.purchaseFlow) && report.purchaseFlow.includes("Deployment"));
assert.equal(report.status, "READY");

console.log(JSON.stringify({
  status: "PASS",
  marketplaceScore: report.marketplaceScore,
  reportPath,
  productCount: report.productCount,
  activeProducts: report.activeProducts,
  featuredProduct: report.featuredProduct,
  productNames: report.productNames.slice(0, 6),
  revenueModel: report.revenueModel,
  commandCenterStatus: commandCenterResult.report.status
}, null, 2));
