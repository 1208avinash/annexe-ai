import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import TelegramClient from "./lib/company/departments/telegram-intelligence/bot/telegram-client.js";
import NotificationService from "./lib/company/departments/telegram-intelligence/bot/notification-service.js";
import TelegramOrchestrator from "./lib/company/departments/telegram-intelligence/telegram-orchestrator.js";
import AdminAccessControl from "./lib/company/departments/telegram-intelligence/security/admin-access-control.js";
import TelegramApprovalService from "./lib/company/departments/telegram-intelligence/approval/telegram-approval-service.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-telegram-approval-controls-"));
const emailOrchestrator = new EmailOrchestrator();
const notificationService = new NotificationService();
const telegramApprovalService = new TelegramApprovalService({
    adminIds: "1001"
});
const telegramOrchestrator = new TelegramOrchestrator({
    client: new TelegramClient({ adminIds: "1001" }),
    accessControl: new AdminAccessControl({ adminIds: "1001" }),
    approvalService: telegramApprovalService,
    notificationService
});

const approvalEmail = {
    id: "approval-email-001",
    from: "sales@customer.com",
    to: "sales@annexe.ai",
    subject: "Need proposal approval",
    body: "Please review and approve our CRM proposal.",
    receivedAt: "2026-08-26T08:00:00.000Z",
    attachments: []
};

const emailResult = emailOrchestrator.processIncomingEmail({
    email: approvalEmail,
    projectRoot,
    project: {
        projectId: "TG-APPROVAL-TEST",
        name: "Telegram Approval Controls Test"
    }
});

const approvalId = emailResult.approval.id;
assert.ok(approvalId);

const approveResult = telegramOrchestrator.processMessage({
    userId: "1001",
    command: "/approve",
    args: approvalId,
    chatId: "telegram-chat-1",
    projectRoot,
    approvalId
});
assert.equal(approveResult.status, "OK");
assert.equal(approveResult.approvalAction.status, "APPROVED");
assert.ok(String(approveResult.response.message).includes("READY_FOR_ACTION"));

const rejectResult = telegramOrchestrator.processMessage({
    userId: "1001",
    command: "/reject",
    args: approvalId,
    chatId: "telegram-chat-1",
    projectRoot,
    approvalId
});
assert.equal(rejectResult.status, "OK");
assert.equal(rejectResult.approvalAction.status, "REJECTED");
assert.ok(String(rejectResult.response.message).includes("REJECTED"));

const editResult = telegramOrchestrator.processMessage({
    userId: "1001",
    command: "/edit",
    args: `${approvalId} Please update the proposal wording.`,
    chatId: "telegram-chat-1",
    projectRoot,
    approvalId,
    messageContent: "Please update the proposal wording."
});
assert.equal(editResult.status, "OK");
assert.equal(editResult.approvalAction.status, "UPDATED");
assert.ok(editResult.approvalAction.approval.reply.body.includes("Please update the proposal wording."));

const deniedResult = telegramOrchestrator.processMessage({
    userId: "9999",
    command: "/approve",
    args: approvalId,
    chatId: "telegram-chat-2",
    projectRoot,
    approvalId
});
assert.equal(deniedResult.status, "ACCESS_DENIED");
assert.equal(deniedResult.response.status, "ACCESS_DENIED");

const approvalStatePath = path.join(projectRoot, "reports", "company", "email", "approval-state.json");
const actionReportPath = path.join(projectRoot, "reports", "company", "telegram", "approval-action-report.json");
assert.ok(fs.existsSync(approvalStatePath));
assert.ok(fs.existsSync(actionReportPath));

const approvalState = JSON.parse(fs.readFileSync(approvalStatePath, "utf8"));
const actionReport = JSON.parse(fs.readFileSync(actionReportPath, "utf8"));

assert.equal(approvalState.status, "EDIT_REQUESTED");
assert.equal(actionReport.approvalsProcessed >= 3, true);
assert.equal(actionReport.approved >= 1, true);
assert.equal(actionReport.rejected >= 1, true);
assert.equal(actionReport.edited >= 1, true);
assert.equal(actionReport.authorizedUsers.includes("1001"), true);

console.log(JSON.stringify({
    status: "PASS",
    approvalId,
    actionReport
}, null, 2));
