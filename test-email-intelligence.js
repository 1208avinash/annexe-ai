import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import { runCompanyOrchestration } from "./lib/company/company-orchestrator.js";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-email-"));
const emailOrchestrator = new EmailOrchestrator();

const mockEmail = {
    id: "email-001",
    from: "alex@realestate-example.com",
    to: "sales@annexe.ai",
    subject: "Need a CRM proposal for our brokerage",
    body: "We are evaluating CRM platforms and would like pricing, timeline, and a demo.",
    receivedAt: "2026-08-26T09:00:00.000Z",
    attachments: []
};

const directResult = emailOrchestrator.processIncomingEmail({
    email: mockEmail,
    projectRoot: tempRoot,
    project: {
        projectId: "EMAIL-TEST",
        name: "Email Intelligence Test"
    }
});

assert.equal(directResult.classification.category, "SALES");
assert.equal(directResult.classification.department, "Sales");
assert.equal(directResult.reply.status, "DRAFT");
assert.equal(directResult.reply.requiresApproval, true);
assert.ok(directResult.memory.senderHistory["alex@realestate-example.com"]);
assert.ok(fs.existsSync(directResult.reportPath));
assert.ok(fs.existsSync(directResult.memoryPath));
assert.equal(directResult.report.emailsProcessed, 1);
assert.equal(directResult.report.draftsCreated, 1);

const companyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-email-company-"));
const companyResult = await runCompanyOrchestration({
    requestText: "Create a CRM for a real estate agency",
    email: mockEmail,
    workspaceRoot: "workspace",
    outputRoot: companyRoot
});

assert.ok(companyResult.success);
assert.ok(companyResult.emailDepartment);
assert.equal(companyResult.emailDepartment.classification.category, "SALES");
assert.equal(companyResult.emailDepartment.reply.status, "DRAFT");

const companyReportPath = path.join(companyResult.projectRoot, "reports", "company-generation-report.json");
assert.ok(fs.existsSync(companyReportPath));

const companyReport = JSON.parse(fs.readFileSync(companyReportPath, "utf8"));
assert.ok(companyReport.emailDepartment);
assert.equal(companyReport.emailDepartment.emailsProcessed >= 1, true);
assert.equal(companyReport.emailDepartment.draftsCreated >= 1, true);
assert.equal(companyReport.emailDepartment.securityFlags >= 0, true);

console.log(JSON.stringify({
    status: "PASS",
    filesCreated: [
        directResult.reportPath,
        directResult.memoryPath,
        companyReportPath
    ],
    classification: directResult.classification,
    replyStatus: directResult.reply.status,
    companyEmailDepartment: companyReport.emailDepartment
}, null, 2));
