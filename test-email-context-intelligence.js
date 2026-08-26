import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import { runCompanyOrchestration } from "./lib/company/company-orchestrator.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-email-context-"));
const orchestrator = new EmailOrchestrator();

const firstEmail = {
    id: "ctx-email-001",
    from: "lead@northwind.com",
    to: "hello@annexe.ai",
    subject: "Need pricing and proposal for an AI CRM",
    body: "We are evaluating options and would like pricing and a proposal.",
    receivedAt: "2026-08-26T08:00:00.000Z",
    attachments: []
};

const secondEmail = {
    id: "ctx-email-002",
    from: "lead@northwind.com",
    to: "sales@annexe.ai",
    subject: "Please send pricing details and proposal deck",
    body: "We would like to review the proposal and finalize pricing for the CRM rollout.",
    receivedAt: "2026-08-26T09:00:00.000Z",
    attachments: []
};

const firstResult = orchestrator.processIncomingEmail({
    email: firstEmail,
    projectRoot,
    project: {
        projectId: "EMAIL-CTX-TEST",
        name: "Email Context Intelligence Test"
    }
});

assert.equal(firstResult.customerContext.customerId, "lead@northwind.com");
assert.equal(firstResult.intent.intent, "SALES_INQUIRY");
assert.equal(firstResult.relationship.currentStage, "INTERESTED");
assert.ok(firstResult.customerContextReport);
assert.ok(fs.existsSync(firstResult.customerContextReportPath));
assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "email", "customer-memory.json")));
assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "email", "conversation-memory.json")));

const secondResult = orchestrator.processIncomingEmail({
    email: secondEmail,
    projectRoot,
    project: {
        projectId: "EMAIL-CTX-TEST",
        name: "Email Context Intelligence Test"
    }
});

assert.equal(secondResult.customerContext.customerId, "lead@northwind.com");
assert.equal(secondResult.intent.intent, "SALES_INQUIRY");
assert.equal(secondResult.relationship.currentStage, "DEMO_REQUESTED");
assert.equal(secondResult.conversationSummary.keyTopics.includes("pricing"), true);
assert.equal(secondResult.conversationSummary.pendingActions.includes("prepare proposal"), true);

const customerMemory = JSON.parse(fs.readFileSync(path.join(projectRoot, "reports", "company", "email", "customer-memory.json"), "utf8"));
const conversationMemory = JSON.parse(fs.readFileSync(path.join(projectRoot, "reports", "company", "email", "conversation-memory.json"), "utf8"));
const customerContextReport = JSON.parse(fs.readFileSync(firstResult.customerContextReportPath, "utf8"));

assert.equal(customerMemory.customersTracked, 1);
assert.equal(conversationMemory.conversationsAnalyzed >= 2, true);
assert.equal(customerContextReport.customersTracked >= 1, true);
assert.equal(customerContextReport.conversationsAnalyzed >= 1, true);
assert.equal(customerContextReport.intentsDetected.SALES_INQUIRY >= 1, true);

const companyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-email-context-company-"));
const companyResult = await runCompanyOrchestration({
    requestText: "Create a CRM for a real estate agency",
    email: secondEmail,
    workspaceRoot: "workspace",
    outputRoot: companyRoot
});

assert.ok(companyResult.success);
assert.ok(companyResult.emailDepartment.customerContext);
assert.ok(companyResult.emailDepartment.intent);
assert.ok(companyResult.emailDepartment.relationship);

const companyReportPath = path.join(companyResult.projectRoot, "reports", "company-generation-report.json");
const companyReport = JSON.parse(fs.readFileSync(companyReportPath, "utf8"));
assert.ok(companyReport.emailDepartment);
assert.ok(companyReport.emailDepartment.customerContext);
assert.ok(companyReport.emailDepartment.intent);
assert.ok(companyReport.emailDepartment.relationship);

console.log(JSON.stringify({
    status: "PASS",
    firstIntent: firstResult.intent,
    secondIntent: secondResult.intent,
    firstStage: firstResult.relationship,
    secondStage: secondResult.relationship,
    companyEmailDepartment: companyReport.emailDepartment
}, null, 2));
