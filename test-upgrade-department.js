import assert from "assert/strict";
import path from "path";
import fs from "fs";

import UpgradeOrchestrator from "./lib/company/departments/upgrade/upgrade-orchestrator.js";

const orchestrator = new UpgradeOrchestrator();
const projectRoot = path.join(process.cwd(), "workspace", "upgrade-department-test");
const result = orchestrator.processRequest({
    requestText: "Upgrade existing AI CRM with AI assistant, analytics dashboard and automation features",
    project: {
        projectId: "TEST-UPGRADE-001",
        name: "Upgrade Department Test"
    },
    projectRoot
});

assert.ok(result.analysis);
assert.ok(result.impact);
assert.ok(result.plan);
assert.ok(result.cost);
assert.ok(result.paymentGate);
assert.ok(result.execution);
assert.ok(result.validation);
assert.ok(result.report);
assert.ok(result.reportPaths);
assert.equal(result.paymentGate.advanceRequired, 50);
assert.equal(result.paymentGate.paymentStatus, "PENDING");
assert.equal(result.paymentGate.executionAllowed, false);
assert.ok(String(result.reportPaths.certification).includes(path.join("reports", "company", "upgrade", "upgrade-lifecycle-report.json")));
assert.ok(fs.existsSync(result.reportPaths.certification));

console.log(JSON.stringify({
    status: "PASS",
    upgradeAnalysisGenerated: true,
    impactAssessmentGenerated: true,
    upgradePlanGenerated: true,
    costEstimateGenerated: true,
    paymentGateGenerated: true,
    executionWorkflowGenerated: true,
    validationGenerated: true,
    upgradeReportGenerated: true,
    reportPath: result.reportPaths.certification
}, null, 2));
