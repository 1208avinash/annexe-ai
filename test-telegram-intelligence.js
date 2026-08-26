import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import TelegramClient from "./lib/company/departments/telegram-intelligence/bot/telegram-client.js";
import TelegramOrchestrator from "./lib/company/departments/telegram-intelligence/telegram-orchestrator.js";
import AdminAccessControl from "./lib/company/departments/telegram-intelligence/security/admin-access-control.js";
import { runCompanyOrchestration } from "./lib/company/company-orchestrator.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-telegram-"));
const client = new TelegramClient({
    token: "mock-token",
    adminIds: "1001"
});
const accessControl = new AdminAccessControl({ adminIds: "1001" });
const orchestrator = new TelegramOrchestrator({
    client,
    accessControl
});

const initResult = client.initialize();
assert.equal(initResult.status, "INITIALIZED");
assert.equal(initResult.adminCount, 1);

const authorizedStatus = orchestrator.processMessage({
    userId: "1001",
    command: "/status",
    chatId: "chat-1",
    projectRoot,
    emailDepartment: {
        report: {
            emailsProcessed: 2
        }
    }
});

assert.equal(authorizedStatus.status, "OK");
assert.equal(authorizedStatus.authorization.authorized, true);
assert.equal(authorizedStatus.response.command, "/status");
assert.ok(String(authorizedStatus.response.message).includes("ANNEXE AI STATUS"));

const unauthorizedStatus = orchestrator.processMessage({
    userId: "9999",
    command: "/status",
    chatId: "chat-2",
    projectRoot
});

assert.equal(unauthorizedStatus.status, "ACCESS_DENIED");
assert.equal(unauthorizedStatus.response.status, "ACCESS_DENIED");

const reportResult = orchestrator.processMessage({
    userId: "1001",
    command: "/report",
    chatId: "chat-1",
    projectRoot,
    companyReport: {
        projectId: "TEST",
        projectName: "ANNEXE AI Telegram Test",
        emailDepartment: {
            emailsProcessed: 2,
            approvalsPending: 1,
            employeeRouting: {
                sales: 1
            }
        }
    }
});

assert.equal(reportResult.response.command, "/report");
assert.ok(reportResult.response.report);
assert.ok(String(reportResult.response.message).includes("ANNEXE AI COMPANY REPORT"));

const ceoResult = orchestrator.processMessage({
    userId: "1001",
    command: "/ceo",
    chatId: "chat-1",
    projectRoot,
    ceoSummary: {
        summary: "AI CEO is monitoring company performance."
    }
});

assert.equal(ceoResult.response.command, "/ceo");
assert.ok(String(ceoResult.response.message).includes("AI CEO SUMMARY"));

const notificationResult = orchestrator.processMessage({
    userId: "1001",
    command: "/help",
    chatId: "chat-1",
    projectRoot,
    notification: {
        type: "Sales Opportunity",
        customer: "ABC Corp",
        action: "Review proposal"
    }
});

assert.ok(notificationResult.notification);
assert.equal(notificationResult.notification.status, "NOTIFICATION_CREATED");
assert.ok(String(notificationResult.notification.message).includes("Sales Opportunity"));

const memoryPath = path.join(projectRoot, "reports", "company", "telegram", "telegram-memory.json");
const reportPath = path.join(projectRoot, "reports", "company", "telegram", "telegram-activity-report.json");
assert.ok(fs.existsSync(memoryPath));
assert.ok(fs.existsSync(reportPath));

const memory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
assert.equal(memory.commandsExecuted >= 3, true);
assert.equal(memory.authorizedUsers.includes("1001"), true);
assert.equal(report.commandsProcessed >= 3, true);
assert.equal(report.activeUsers >= 1, true);

const companyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-telegram-company-"));
const companyResult = await runCompanyOrchestration({
    requestText: "Create a CRM for a real estate agency",
    workspaceRoot: "workspace",
    outputRoot: companyRoot,
    telegram: {
        adminIds: "1001",
        userId: "1001",
        command: "/report",
        chatId: "chat-1"
    }
});

assert.ok(companyResult.success);
assert.ok(companyResult.telegramDepartment);

const companyReportPath = path.join(companyResult.projectRoot, "reports", "company-generation-report.json");
const companyReport = JSON.parse(fs.readFileSync(companyReportPath, "utf8"));
assert.ok(companyReport.telegramDepartment);
assert.equal(companyReport.telegramDepartment.commandsProcessed >= 1, true);
assert.equal(companyReport.telegramDepartment.activeUsers >= 1, true);

console.log(JSON.stringify({
    status: "PASS",
    telegramReport: report,
    companyTelegramDepartment: companyReport.telegramDepartment
}, null, 2));
