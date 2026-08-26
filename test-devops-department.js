import assert from "assert/strict";
import path from "path";
import fs from "fs";

import DevOpsOrchestrator from "./lib/company/departments/devops/devops-orchestrator.js";

const orchestrator = new DevOpsOrchestrator();
const projectRoot = path.join(process.cwd(), "workspace", "devops-department-test");
const result = orchestrator.processRequest({
    requestText: "Create an AI CRM platform for real estate companies",
    project: {
        projectId: "TEST-DEVOPS-001",
        name: "DevOps Department Test"
    },
    projectRoot,
    analysis: {
        users: ["Sales teams", "Managers"]
    },
    architectureDepartment: {
        solution: { status: "READY" },
        cloud: { status: "READY" }
    },
    engineeringDepartment: {
        executionPlan: { status: "READY" }
    },
    qaResults: {
        api: { passed: true },
        backend: { passed: true }
    }
});

assert.ok(result.deployment);
assert.ok(result.cloudOperations);
assert.ok(result.monitoring);
assert.ok(result.incidentResponse);
assert.ok(result.scaling);
assert.ok(result.recovery);
assert.ok(result.optimization);
assert.ok(result.report);
assert.ok(result.reportPaths);
assert.equal(result.report.status, "APPROVED");
assert.ok(String(result.reportPaths.certification).includes(path.join("reports", "company", "devops", "devops-operations-report.json")));
assert.ok(fs.existsSync(result.reportPaths.certification));

console.log(JSON.stringify({
    status: "PASS",
    deploymentPlanGenerated: true,
    cloudOperationsGenerated: true,
    monitoringStrategyGenerated: true,
    incidentResponseGenerated: true,
    scalingPlanGenerated: true,
    disasterRecoveryGenerated: true,
    optimizationReportGenerated: true,
    devopsOperationsReportGenerated: true,
    reportPath: result.reportPaths.certification,
    operationsScore: result.report.operationsScore
}, null, 2));
