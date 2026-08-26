import assert from "assert/strict";
import path from "path";

import SalesOrchestrator from "./lib/company/departments/sales/sales-orchestrator.js";

const orchestrator = new SalesOrchestrator();
const result = orchestrator.processRequest({
    requestText: "Build an AI CRM platform for real estate companies",
    industry: "Real Estate",
    projectRoot: path.join("workspace", "sales-department-test"),
    project: {
        projectId: "sales-department-test",
        name: "AI CRM Sales Platform"
    }
});

assert.ok(result.leadAnalysis, "Expected lead analysis");
assert.ok(result.discovery, "Expected customer discovery");
assert.ok(result.proposal, "Expected sales proposal");
assert.ok(result.negotiation, "Expected negotiation analysis");
assert.ok(result.forecast, "Expected sales forecast");
assert.ok(result.report, "Expected sales report");
assert.ok(result.reportPath, "Expected sales report path");
assert.equal(result.proposal.paymentMilestones?.[0]?.percentage, 50, "Expected 50% advance payment");
assert.equal(result.proposal.paymentMilestones?.[1]?.percentage, 50, "Expected 50% completion payment");
assert.equal(result.reportPath.replace(/\\/g, "/").includes("reports/company/sales/sales-intelligence-report.json"), true);

console.log(JSON.stringify({
    status: "PASS",
    leadAnalysisGenerated: true,
    customerDiscoveryGenerated: true,
    proposalGenerated: true,
    negotiationAnalysisGenerated: true,
    salesForecastGenerated: true,
    salesReportGenerated: true,
    reportPath: result.reportPath,
    leadScore: result.leadAnalysis.leadScore
}, null, 2));
