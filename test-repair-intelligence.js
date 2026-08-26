import assert from "assert/strict";
import path from "path";

import RepairOrchestrator from "./lib/repair-intelligence/repair-orchestrator.js";

const orchestrator = new RepairOrchestrator();
const result = await orchestrator.processRequest({
    requestText: "CRM login stopped working after authentication update",
    projectRoot: path.join("workspace", "repair-intelligence-test"),
    project: {
        projectId: "repair-intelligence-test",
        name: "Repair Intelligence Test"
    }
});

assert.equal(result.issueDetected, true, "Expected an issue to be detected");
assert.equal(result.diagnosis.category, "BUG");
assert.ok(
    ["HIGH", "CRITICAL"].includes(result.diagnosis.severity),
    `Unexpected severity: ${result.diagnosis.severity}`
);
assert.ok(Array.isArray(result.repairPlan.repairSteps) && result.repairPlan.repairSteps.length > 0, "Expected repair steps");
assert.ok(result.estimate.costEstimate > 0, "Expected a cost estimate");
assert.equal(result.paymentGateCreated, true, "Expected a payment gate");
assert.equal(result.paymentGate.requiredAdvancePercentage, 50, "Expected a 50% advance gate");
assert.ok(result.report?.repairId, "Expected a repair report");

console.log(JSON.stringify({
    status: "PASS",
    issueDetected: result.issueDetected,
    category: result.diagnosis.category,
    severity: result.diagnosis.severity,
    costEstimate: result.estimate.costEstimate,
    paymentGate: {
        requiredAdvancePercentage: result.paymentGate.requiredAdvancePercentage,
        status: result.paymentGate.status,
        developmentUnlocked: result.paymentGate.developmentUnlocked
    },
    reportId: result.report.repairId
}, null, 2));
