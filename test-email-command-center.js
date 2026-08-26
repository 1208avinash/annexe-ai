import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import ApprovalDashboardService from "./lib/company/departments/email-intelligence/dashboard/approval-dashboard-service.js";
import EmailDashboardService from "./lib/company/departments/email-intelligence/dashboard/email-dashboard-service.js";
import CustomerInsightService from "./lib/company/departments/email-intelligence/dashboard/customer-insight-service.js";
import EmployeeActivityService from "./lib/company/departments/email-intelligence/dashboard/employee-activity-service.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-email-command-center-"));
const orchestrator = new EmailOrchestrator();
const approvalDashboardService = new ApprovalDashboardService();
const emailDashboardService = new EmailDashboardService();
const customerInsightService = new CustomerInsightService();
const employeeActivityService = new EmployeeActivityService();

const firstEmail = {
    id: "command-center-001",
    from: "lead@northwind.com",
    to: "sales@annexe.ai",
    subject: "Need pricing and a CRM proposal",
    body: "We would like pricing, a demo, and an implementation proposal.",
    receivedAt: "2026-08-26T08:00:00.000Z",
    attachments: []
};

const firstResult = orchestrator.processIncomingEmail({
    email: firstEmail,
    projectRoot,
    project: {
        projectId: "EMAIL-COMMAND-CENTER-TEST",
        name: "Email Command Center Test"
    }
});

assert.equal(firstResult.reply.status, "DRAFT");
assert.ok(firstResult.commandCenterReportPath);
assert.ok(fs.existsSync(firstResult.commandCenterReportPath));

const dashboardOne = emailDashboardService.summarize({
    email: firstEmail,
    classification: firstResult.classification,
    route: firstResult.route,
    approval: firstResult.approval,
    analytics: firstResult.analytics,
    security: firstResult.security
}, projectRoot);
assert.equal(dashboardOne.dashboard.inbox.processed >= 1, true);
assert.equal(dashboardOne.dashboard.inbox.pendingApproval >= 1, true);

const approvalsOne = approvalDashboardService.summarize({
    email: firstEmail,
    employeeRouting: firstResult.employeeRouting,
    approval: firstResult.approval,
    reply: firstResult.reply
}, projectRoot);
assert.equal(approvalsOne.pending.length, 1);
assert.equal(approvalsOne.pending[0].aiEmployee, "AI Sales Employee");

const editResult = approvalDashboardService.editReply(firstResult.approval.id, {
    body: "Updated human-approved draft reply"
}, projectRoot, ["human edit"]);
assert.equal(editResult.state.status, "EDIT_REQUESTED");
assert.equal(editResult.state.reply.body, "Updated human-approved draft reply");

const approveResult = approvalDashboardService.approveReply(firstResult.approval.id, projectRoot, ["approved"]);
assert.equal(approveResult.state.status, "APPROVED");
assert.equal(approveResult.state.approved, true);

const secondEmail = {
    id: "command-center-002",
    from: "ops@customer.com",
    to: "support@annexe.ai",
    subject: "Dashboard error after login",
    body: "Users cannot access the dashboard after logging in.",
    receivedAt: "2026-08-26T09:00:00.000Z",
    attachments: []
};

const secondResult = orchestrator.processIncomingEmail({
    email: secondEmail,
    projectRoot,
    project: {
        projectId: "EMAIL-COMMAND-CENTER-TEST",
        name: "Email Command Center Test"
    }
});

assert.equal(secondResult.employeeRouting.employee, "AI Support Employee");
assert.equal(secondResult.reply.status, "DRAFT");

const rejectResult = approvalDashboardService.rejectReply(secondResult.approval.id, projectRoot, ["rejected"]);
assert.equal(rejectResult.state.status, "REJECTED");
assert.equal(rejectResult.state.approved, false);

const dashboardTwo = emailDashboardService.summarize({
    email: secondEmail,
    classification: secondResult.classification,
    route: secondResult.route,
    approval: secondResult.approval,
    analytics: secondResult.analytics,
    security: secondResult.security
}, projectRoot);
assert.equal(dashboardTwo.dashboard.inbox.processed >= 2, true);
assert.equal(dashboardTwo.dashboard.priority.high >= 1, true);

const customerInsights = customerInsightService.summarize(projectRoot);
const employeeActivity = employeeActivityService.summarize(projectRoot);

const commandCenterReport = JSON.parse(fs.readFileSync(secondResult.commandCenterReportPath, "utf8"));
assert.ok(commandCenterReport.dashboard);
assert.ok(commandCenterReport.approvals);
assert.ok(commandCenterReport.customers);
assert.ok(commandCenterReport.employees);
assert.equal(Array.isArray(customerInsights.customers), true);
assert.equal(Array.isArray(customerInsights.activeConversations), true);
assert.equal(typeof employeeActivity.employees.sales.emailsHandled, "number");
assert.equal(typeof employeeActivity.employees.support.actionsCreated, "number");

console.log(JSON.stringify({
    status: "PASS",
    dashboard: dashboardTwo.dashboard,
    approvals: approvalsOne,
    commandCenterReportId: commandCenterReport.reportId,
    employeeActivity
}, null, 2));
