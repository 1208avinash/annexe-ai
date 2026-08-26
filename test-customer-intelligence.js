import assert from "assert/strict";

import CustomerOrchestrator from "./lib/customer-intelligence/customer-orchestrator.js";

const orchestrator = new CustomerOrchestrator();
const result = orchestrator.processRequest({
    requestText: "CRM login is broken and customers cannot access dashboard"
});

assert.equal(result.classification.type, "BUG");
assert.equal(result.priority, "CRITICAL");
assert.equal(result.assignedDepartment, "Repair");
assert.ok(Array.isArray(result.actionPlan) && result.actionPlan.length > 0, "Expected a non-empty action plan");
assert.ok(result.report, "Expected a customer service report");
assert.equal(result.report.classification.type, "BUG");
assert.equal(result.report.priority, "CRITICAL");
assert.equal(result.report.assignedDepartment, "Repair");

console.log(JSON.stringify({
    status: "PASS",
    classification: result.classification.type,
    priority: result.priority,
    department: result.assignedDepartment,
    actionPlan: result.actionPlan,
    reportId: result.report.reportId
}, null, 2));
