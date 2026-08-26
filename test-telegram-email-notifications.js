import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import TelegramClient from "./lib/company/departments/telegram-intelligence/bot/telegram-client.js";
import TelegramNotificationService from "./lib/company/departments/telegram-intelligence/bot/notification-service.js";
import AdminAccessControl from "./lib/company/departments/telegram-intelligence/security/admin-access-control.js";
import TelegramOrchestrator from "./lib/company/departments/telegram-intelligence/telegram-orchestrator.js";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-telegram-email-notifications-"));
const emailOrchestrator = new EmailOrchestrator();
const telegramNotificationService = new TelegramNotificationService();
const telegramOrchestrator = new TelegramOrchestrator({
    client: new TelegramClient({ adminIds: "1001" }),
    accessControl: new AdminAccessControl({ adminIds: "1001" })
});

const notificationTypes = [];
const notifications = [];

const salesEmail = {
    id: "tg-email-sales-001",
    from: "sales@abc-corp.com",
    to: "sales@annexe.ai",
    subject: "Need a CRM proposal",
    body: "ABC Corp wants pricing and a proposal for the CRM rollout.",
    receivedAt: "2026-08-26T08:00:00.000Z",
    attachments: []
};
const supportEmail = {
    id: "tg-email-support-001",
    from: "support@xyz-ltd.com",
    to: "support@annexe.ai",
    subject: "Dashboard issue",
    body: "Customers cannot access the dashboard.",
    receivedAt: "2026-08-26T09:00:00.000Z",
    attachments: []
};
const securityEmail = {
    id: "tg-email-security-001",
    from: "security@client.com",
    to: "security@annexe.ai",
    subject: "Critical security alert",
    body: "We detected suspicious access and need a review.",
    receivedAt: "2026-08-26T10:00:00.000Z",
    attachments: []
};

const salesResult = emailOrchestrator.processIncomingEmail({
    email: salesEmail,
    projectRoot,
    project: {
        projectId: "TG-EMAIL-NOTIFY",
        name: "Telegram Email Notifications Test"
    }
});
assert.equal(salesResult.classification.category, "SALES");
const salesNotification = telegramNotificationService.sendNotification({
    type: "Sales Opportunity",
    customer: "ABC Corp",
    action: "Review proposal"
});
notifications.push(salesNotification);
notificationTypes.push("Sales Opportunity");
assert.ok(String(salesNotification.message).includes("Sales Opportunity"));

const supportResult = emailOrchestrator.processIncomingEmail({
    email: supportEmail,
    projectRoot,
    project: {
        projectId: "TG-EMAIL-NOTIFY",
        name: "Telegram Email Notifications Test"
    }
});
assert.equal(supportResult.classification.category, "SUPPORT");
const supportNotification = telegramNotificationService.sendNotification({
    type: "Support Alert",
    customer: "XYZ Ltd",
    action: "Investigate support case"
});
notifications.push(supportNotification);
notificationTypes.push("Support Alert");
assert.ok(String(supportNotification.message).includes("Support Alert"));

const securityResult = emailOrchestrator.processIncomingEmail({
    email: securityEmail,
    projectRoot,
    project: {
        projectId: "TG-EMAIL-NOTIFY",
        name: "Telegram Email Notifications Test"
    }
});
assert.equal(securityResult.classification.category, "SECURITY");
const securityNotification = telegramNotificationService.sendNotification({
    type: "Security Alert",
    customer: "Security Team",
    action: "Critical review"
});
notifications.push(securityNotification);
notificationTypes.push("Security Alert");
assert.ok(String(securityNotification.message).includes("Security Alert"));

const ceoSummaryNotification = telegramNotificationService.sendNotification({
    type: "AI CEO Brief",
    customer: "ANNEXE AI",
    action: "Review daily summary"
});
notifications.push(ceoSummaryNotification);
notificationTypes.push("AI CEO Brief");
assert.ok(String(ceoSummaryNotification.message).includes("AI CEO Brief"));

const telegramResult = telegramOrchestrator.processMessage({
    userId: "1001",
    command: "/status",
    chatId: "telegram-chat-1",
    projectRoot,
    notification: {
        type: "Sales Opportunity",
        customer: "ABC Corp",
        action: "Review proposal"
    }
});
assert.equal(telegramResult.status, "OK");

const activityReport = {
    status: "PASS",
    notificationsCreated: notifications.length,
    notificationTypes,
    latestTelegramStatus: telegramResult.status,
    latestTelegramCommand: telegramResult.command?.command ?? null
};

const reportPath = path.join(projectRoot, "reports", "company", "telegram", "notification-activity-report.json");
writeJson(reportPath, activityReport);

assert.ok(fs.existsSync(reportPath));

console.log(JSON.stringify({
    status: "PASS",
    notificationsCreated: activityReport.notificationsCreated,
    notificationTypes: activityReport.notificationTypes
}, null, 2));
