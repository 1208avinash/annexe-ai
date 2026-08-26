import assert from "assert/strict";
import fs from "fs";
import path from "path";

import { runProductionSaaSPlatform } from "./lib/platform/production-saas-platform.js";
import { runEnterpriseScalingPlatform } from "./lib/platform/enterprise-scaling-platform.js";
import { runCommandCenterPlatform } from "./lib/platform/command-center-platform.js";

const workspaceRoot = path.join(process.cwd(), "workspace", "command-center-test");
fs.rmSync(workspaceRoot, { recursive: true, force: true });

const productionResult = await runProductionSaaSPlatform({
  workspaceRoot: path.join(workspaceRoot, "production"),
  requestText: "Create a production SaaS platform with enterprise customer and admin experiences."
});

const enterpriseResult = await runEnterpriseScalingPlatform({
  workspaceRoot: path.join(workspaceRoot, "enterprise"),
  productionResult,
  includeProductionPlatform: false,
  requestText: "Scale the customer command center for enterprise workloads."
});

const commandCenterResult = await runCommandCenterPlatform({
  workspaceRoot: path.join(workspaceRoot, "command-center"),
  productionResult,
  enterpriseResult,
  customerQuestion: "What improvements do you recommend?"
});

assert.ok(commandCenterResult.success);
assert.ok(fs.existsSync(commandCenterResult.reportPath));

const customerCenter = commandCenterResult.commandCenter.customerCommandCenter;
const adminCenter = commandCenterResult.commandCenter.adminCommandCenter;

assert.ok(customerCenter);
assert.ok(customerCenter.aiCompanyStatus.length > 0);
assert.ok(customerCenter.projectCommandCenter.projectName);
assert.ok(customerCenter.liveAiFactory.liveEvents.length > 0);
assert.ok(customerCenter.documentCenter.proposal !== undefined);
assert.ok(customerCenter.paymentCenter !== undefined);
assert.ok(customerCenter.evolutionCenter.recommendations.length > 0);
assert.ok(customerCenter.aiCeoAssistant.answer.length > 0);
assert.ok(adminCenter.sections.ceo);
assert.ok(adminCenter.sections.sales);
assert.ok(adminCenter.sections.engineering);
assert.ok(commandCenterResult.report.customerExperienceScore >= 100);
assert.ok(commandCenterResult.report.dashboardReadiness >= 100);
assert.equal(commandCenterResult.report.status, "READY");

console.log(JSON.stringify({
  status: "PASS",
  readinessScore: commandCenterResult.report.customerExperienceScore,
  reportPath: commandCenterResult.reportPath,
  liveEvents: customerCenter.realtime.liveEvents,
  aiAnswer: customerCenter.aiCeoAssistant.answer,
  adminSections: Object.keys(adminCenter.sections)
}, null, 2));
