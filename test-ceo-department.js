import assert from "assert/strict";
import path from "path";

import CEOOrchestrator from "./lib/company/departments/ceo/ceo-orchestrator.js";

const orchestrator = new CEOOrchestrator();
const result = orchestrator.processRequest({
    requestText: "Create an AI CRM platform for real estate companies",
    industry: "Real Estate",
    projectRoot: path.join("workspace", "ceo-department-test"),
    project: {
        projectId: "ceo-department-test",
        name: "AI CRM Platform"
    }
});

assert.ok(result.marketAnalysis, "Expected market analysis");
assert.ok(result.strategy, "Expected strategy output");
assert.ok(result.financialForecast, "Expected financial forecast");
assert.ok(result.riskAnalysis, "Expected risk analysis");
assert.ok(result.report, "Expected CEO report");
assert.ok(result.reportPath, "Expected CEO report path");
assert.equal(result.reportPath.replace(/\\/g, "/").includes("reports/company/ceo/ceo-strategy-report.json"), true);

console.log(JSON.stringify({
    status: "PASS",
    marketAnalysisGenerated: true,
    strategyGenerated: true,
    financialForecastGenerated: true,
    riskAnalysisGenerated: true,
    reportGenerated: true,
    reportPath: result.reportPath
}, null, 2));
