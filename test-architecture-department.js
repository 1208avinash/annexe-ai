import assert from "assert/strict";
import path from "path";

import ArchitectureOrchestrator from "./lib/company/departments/architecture/architecture-orchestrator.js";

const orchestrator = new ArchitectureOrchestrator();
const result = orchestrator.processRequest({
    requestText: "Create an AI CRM platform for real estate companies",
    projectRoot: path.join("workspace", "architecture-department-test"),
    project: {
        projectId: "architecture-department-test",
        name: "AI CRM Architecture"
    },
    analysis: {
        industry: "Real Estate"
    },
    productDepartment: {
        productStrategy: {
            vision: "AI powered CRM platform"
        }
    }
});

assert.ok(result.solution, "Expected solution architecture");
assert.ok(result.cloud, "Expected cloud architecture");
assert.ok(result.security, "Expected security architecture");
assert.ok(result.database, "Expected database architecture");
assert.ok(result.integration, "Expected integration architecture");
assert.ok(result.scaling, "Expected scaling strategy");
assert.ok(result.report, "Expected architecture report");
assert.ok(result.reportPath, "Expected architecture report path");
assert.equal(result.reportPath.replace(/\\/g, "/").includes("reports/company/architecture/enterprise-architecture-report.json"), true);

console.log(JSON.stringify({
    status: "PASS",
    solutionArchitectureGenerated: true,
    cloudArchitectureGenerated: true,
    securityArchitectureGenerated: true,
    databaseArchitectureGenerated: true,
    integrationArchitectureGenerated: true,
    scalingStrategyGenerated: true,
    architectureReportGenerated: true,
    reportPath: result.reportPath
}, null, 2));
