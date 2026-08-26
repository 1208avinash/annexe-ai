import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import MailboxPollingService from "./lib/company/departments/email-intelligence/polling/mailbox-polling-service.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-email-phase2-"));
const orchestrator = new EmailOrchestrator();
const pollingService = new MailboxPollingService({ orchestrator, intervalMs: 100 });

const mockSalesEmail = {
    id: "email-sales-001",
    from: "vp-sales@northwind.com",
    to: "sales@annexe.ai",
    subject: "Need pricing and proposal for our CRM rollout",
    body: "Please send pricing, implementation timeline, and a draft proposal for our team.",
    receivedAt: "2026-08-26T10:00:00.000Z",
    attachments: []
};

const firstPoll = await pollingService.pollOnce({
    messages: [mockSalesEmail],
    projectRoot,
    project: {
        projectId: "EMAIL-PHASE2-TEST",
        name: "Email Intelligence Phase 2 Test"
    }
});

assert.equal(firstPoll.processedCount, 1);
assert.equal(firstPoll.messages.length, 1);

const processed = firstPoll.messages[0];
assert.equal(processed.classification.category, "SALES");
assert.equal(processed.route.department, "sales");
assert.equal(processed.route.action, "draft_reply");
assert.equal(processed.reply.status, "DRAFT");
assert.equal(processed.approval.status, "PENDING_APPROVAL");
assert.equal(processed.approval.approved, false);
assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "email", "approval-state.json")));
assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "email", "email-analytics.json")));

const analytics = JSON.parse(fs.readFileSync(path.join(projectRoot, "reports", "company", "email", "email-analytics.json"), "utf8"));
assert.equal(analytics.emailsProcessed, 1);
assert.equal(analytics.draftsCreated, 1);
assert.equal(analytics.pendingApproval, 1);
assert.equal(analytics.categories.SALES, 1);
assert.equal(analytics.departments.sales, 1);

const secondPoll = await pollingService.pollOnce({
    messages: [mockSalesEmail],
    projectRoot,
    project: {
        projectId: "EMAIL-PHASE2-TEST",
        name: "Email Intelligence Phase 2 Test"
    }
});

assert.equal(secondPoll.processedCount, 0);

const approvalState = JSON.parse(fs.readFileSync(path.join(projectRoot, "reports", "company", "email", "approval-state.json"), "utf8"));
assert.equal(approvalState.status, "PENDING_APPROVAL");
assert.equal(approvalState.approved, false);
assert.equal(approvalState.action, "draft_reply");

console.log(JSON.stringify({
    status: "PASS",
    processedCount: firstPoll.processedCount,
    category: processed.classification.category,
    route: processed.route,
    draftStatus: processed.reply.status,
    approvalState,
    analytics
}, null, 2));
