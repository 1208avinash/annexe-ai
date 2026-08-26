import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-email-employee-routing-"));
const orchestrator = new EmailOrchestrator();

const cases = [
    {
        name: "sales",
        email: {
            id: "sales-1",
            from: "sales@customer.com",
            to: "hello@annexe.ai",
            subject: "Need a CRM demo and pricing proposal",
            body: "Please send pricing and schedule a demo.",
            receivedAt: "2026-08-26T08:00:00.000Z",
            attachments: []
        },
        expected: "AI Sales Employee"
    },
    {
        name: "support",
        email: {
            id: "support-1",
            from: "ops@customer.com",
            to: "support@annexe.ai",
            subject: "Our dashboard is broken",
            body: "Users cannot log in and the dashboard shows an error.",
            receivedAt: "2026-08-26T09:00:00.000Z",
            attachments: []
        },
        expected: "AI Support Employee"
    },
    {
        name: "security",
        email: {
            id: "security-1",
            from: "it@customer.com",
            to: "security@annexe.ai",
            subject: "Possible phishing email and credential breach",
            body: "We detected suspicious access and a phishing attempt.",
            receivedAt: "2026-08-26T10:00:00.000Z",
            attachments: []
        },
        expected: "AI Security Employee"
    },
    {
        name: "billing",
        email: {
            id: "billing-1",
            from: "finance@customer.com",
            to: "billing@annexe.ai",
            subject: "Invoice payment question",
            body: "Please review our invoice and refund request.",
            receivedAt: "2026-08-26T11:00:00.000Z",
            attachments: []
        },
        expected: "AI Billing Employee"
    },
    {
        name: "general",
        email: {
            id: "general-1",
            from: "info@customer.com",
            to: "hello@annexe.ai",
            subject: "General question about ANNEXE AI",
            body: "I would like to learn more about your platform.",
            receivedAt: "2026-08-26T12:00:00.000Z",
            attachments: []
        },
        expected: "AI CEO"
    }
];

const results = [];
for (const testCase of cases) {
    const result = orchestrator.processIncomingEmail({
        email: testCase.email,
        projectRoot,
        project: {
            projectId: "EMAIL-EMP-ROUTING-TEST",
            name: "Email Employee Routing Test"
        }
    });

    results.push(result);
    assert.equal(result.employeeRouting.employee, testCase.expected, `${testCase.name} routing failed`);
    assert.ok(result.employeeRoutingReportPath);
    assert.ok(fs.existsSync(result.employeeRoutingReportPath));
}

const routingReport = JSON.parse(fs.readFileSync(path.join(projectRoot, "reports", "company", "email", "employee-routing-report.json"), "utf8"));

assert.equal(routingReport.routedEmails, cases.length);
assert.equal(routingReport.employeesActivated["AI Sales Employee"] >= 1, true);
assert.equal(routingReport.employeesActivated["AI Support Employee"] >= 1, true);
assert.equal(routingReport.employeesActivated["AI Security Employee"] >= 1, true);
assert.equal(routingReport.employeesActivated["AI Billing Employee"] >= 1, true);
assert.equal(routingReport.employeesActivated["AI CEO"] >= 1, true);
assert.equal(routingReport.departmentsTriggered.sales >= 1, true);
assert.equal(routingReport.departmentsTriggered.support >= 1, true);
assert.equal(routingReport.departmentsTriggered.security >= 1, true);
assert.equal(routingReport.departmentsTriggered.billing >= 1, true);
assert.equal(routingReport.departmentsTriggered.ceo >= 1, true);

console.log(JSON.stringify({
    status: "PASS",
    routedEmails: routingReport.routedEmails,
    employeesActivated: routingReport.employeesActivated,
    departmentsTriggered: routingReport.departmentsTriggered,
    actionsCreated: routingReport.actionsCreated,
    latestRoute: routingReport.latestRoute
}, null, 2));
