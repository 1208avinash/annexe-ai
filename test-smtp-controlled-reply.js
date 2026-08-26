import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import EmailSendService from "./lib/company/departments/email-intelligence/production/smtp/email-send-service.js";
import SmtpClient from "./lib/company/departments/email-intelligence/production/smtp/smtp-client.js";
import SmtpSecurityWrapper from "./lib/company/departments/email-intelligence/production/smtp/smtp-security-wrapper.js";
import ApprovalExecutionService from "./lib/company/departments/telegram-intelligence/approval/approval-execution-service.js";
import TelegramApprovalService from "./lib/company/departments/telegram-intelligence/approval/telegram-approval-service.js";
import TelegramClient from "./lib/company/departments/telegram-intelligence/bot/telegram-client.js";
import NotificationService from "./lib/company/departments/telegram-intelligence/bot/notification-service.js";
import AdminAccessControl from "./lib/company/departments/telegram-intelligence/security/admin-access-control.js";
import TelegramOrchestrator from "./lib/company/departments/telegram-intelligence/telegram-orchestrator.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-smtp-controlled-"));
const emailOrchestrator = new EmailOrchestrator();

const approvedEmail = {
    id: "smtp-approved-email",
    from: "customer@example.com",
    to: "sales@annexai.co.uk",
    subject: "Need proposal approval",
    body: "Please review and approve our CRM proposal.",
    receivedAt: "2026-08-26T11:00:00.000Z",
    attachments: []
};

const emailResult = emailOrchestrator.processIncomingEmail({
    email: approvedEmail,
    projectRoot,
    project: {
        projectId: "SMTP-TEST",
        name: "SMTP Controlled Reply Test"
    }
});

assert.equal(emailResult.approval.status, "PENDING_APPROVAL");

const smtpClient = new SmtpClient({
    env: {
        EMAIL_SMTP_HOST: "smtp.namecheap.com",
        EMAIL_SMTP_PORT: "587",
        EMAIL_USER: "hello@annexai.co.uk",
        EMAIL_PASSWORD: "mock-password",
        EMAIL_TLS: "true"
    }
});
const securityWrapper = new SmtpSecurityWrapper();
const sendService = new EmailSendService({
    smtpClient,
    securityWrapper
});
const executionService = new ApprovalExecutionService({
    emailSendService: sendService
});
const approvalService = new TelegramApprovalService({
    adminIds: "1001",
    approvalExecutionService: executionService
});
const telegramOrchestrator = new TelegramOrchestrator({
    approvalService,
    notificationService: new NotificationService(),
    client: new TelegramClient({ adminIds: "1001" }),
    accessControl: new AdminAccessControl({ adminIds: "1001" })
});

const pendingBlocked = sendService.sendApprovedReply({
    projectRoot,
    approval: emailResult.approval,
    sender: "hello@annexai.co.uk",
    recipient: approvedEmail.from
});
assert.equal(pendingBlocked.status, "BLOCKED");
assert.equal(pendingBlocked.reason, "APPROVAL_NOT_APPROVED");

const approveResult = telegramOrchestrator.processMessage({
    userId: "1001",
    command: "/approve",
    args: emailResult.approval.id,
    chatId: "telegram-smtp-1",
    projectRoot,
    approvalId: emailResult.approval.id,
    sender: "hello@annexai.co.uk",
    recipient: approvedEmail.from
});

assert.equal(approveResult.status, "OK");
assert.equal(approveResult.approvalAction.status, "APPROVED");
assert.equal(approveResult.approvalAction.execution.status, "SENT");
assert.equal(approveResult.approvalAction.execution.sendResult.status, "SENT");

const unauthorizedApproval = telegramOrchestrator.processMessage({
    userId: "9999",
    command: "/approve",
    args: emailResult.approval.id,
    chatId: "telegram-smtp-2",
    projectRoot,
    approvalId: emailResult.approval.id
});
assert.equal(unauthorizedApproval.status, "ACCESS_DENIED");

const auditPath = path.join(projectRoot, "reports", "company", "email", "email-send-audit.json");
assert.ok(fs.existsSync(auditPath));

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
assert.equal(audit.sent >= 1, true);
assert.equal(audit.failed >= 1, true);
assert.equal(audit.approvalsUsed >= 1, true);

console.log(JSON.stringify({
    status: "PASS",
    approvalId: emailResult.approval.id,
    approvalExecution: approveResult.approvalAction.execution,
    audit
}, null, 2));
