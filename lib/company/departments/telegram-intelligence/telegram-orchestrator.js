import fs from "fs";
import path from "path";

import TelegramClient from "./bot/telegram-client.js";
import CommandHandler from "./bot/command-handler.js";
import NotificationService from "./bot/notification-service.js";
import AdminAccessControl from "./security/admin-access-control.js";
import TelegramActivityReportGenerator from "./reports/telegram-activity-report-generator.js";
import TelegramApprovalService from "./approval/telegram-approval-service.js";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultMemory() {
    return {
        commandsExecuted: 0,
        authorizedUsers: [],
        lastActivity: null
    };
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}

export default class TelegramOrchestrator {
    constructor({
        client = new TelegramClient(),
        commandHandler = new CommandHandler(),
        notificationService = new NotificationService(),
        accessControl = new AdminAccessControl(),
        approvalService = new TelegramApprovalService(),
        reportGenerator = new TelegramActivityReportGenerator()
    } = {}) {
        this.client = client;
        this.commandHandler = commandHandler;
        this.notificationService = notificationService;
        this.accessControl = accessControl;
        this.approvalService = approvalService;
        this.reportGenerator = reportGenerator;
    }

    loadMemory(projectRoot = null) {
        if (!projectRoot) {
            return defaultMemory();
        }

        const filePath = path.join(projectRoot, "reports", "company", "telegram", "telegram-memory.json");
        const memory = readJson(filePath);
        return memory ?? defaultMemory();
    }

    persistMemory(memory = defaultMemory(), projectRoot = null) {
        if (!projectRoot) {
            return { memory, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "telegram", "telegram-memory.json");
        writeJson(filePath, memory);
        return { memory, path: filePath };
    }

    processMessage(input = {}) {
        const received = this.client.receiveCommand(input.message ?? input);
        const authorization = this.accessControl.authorize({
            userId: received.userId,
            command: received.command
        });

        if (!authorization.authorized) {
            return {
                status: "ACCESS_DENIED",
                response: this.accessControl.deny(),
                memory: this.loadMemory(input.projectRoot ?? null),
                report: null,
                reportPath: null
            };
        }

        const memory = this.loadMemory(input.projectRoot ?? null);
        if (!memory.authorizedUsers.includes(received.userId)) {
            memory.authorizedUsers.push(received.userId);
        }
        memory.commandsExecuted += 1;
        memory.lastActivity = new Date().toISOString();

        const commandResult = this.commandHandler.handle({
            command: received.command,
            args: received.args ?? "",
            context: {
                ...input.context,
                companyReport: input.companyReport ?? {},
                telegramReport: input.telegramReport ?? {},
                ceoSummary: input.ceoSummary ?? {},
                emailDepartment: input.emailDepartment ?? null,
                employeeStatus: input.employeeStatus ?? "READY",
                systemStatus: input.systemStatus ?? "ONLINE",
                approvalId: input.approvalId ?? null
            }
        });

        let approvalActionResult = null;
        if (received.command === "/approve") {
            approvalActionResult = this.approvalService.approve(input.approvalId ?? received.args ?? "", {
                userId: received.userId,
                projectRoot: input.projectRoot ?? null,
                notes: input.notes ?? []
            });
        }
        else if (received.command === "/reject") {
            approvalActionResult = this.approvalService.reject(input.approvalId ?? received.args ?? "", {
                userId: received.userId,
                projectRoot: input.projectRoot ?? null,
                notes: input.notes ?? []
            });
        }
        else if (received.command === "/edit") {
            approvalActionResult = this.approvalService.edit(
                input.approvalId ?? received.args?.split(/\s+/)?.[0] ?? "",
                input.messageContent ?? received.args?.split(/\s+/)?.slice(1).join(" ") ?? "",
                {
                    userId: received.userId,
                    projectRoot: input.projectRoot ?? null,
                    notes: input.notes ?? []
                }
            );
        }

        const notificationResult = input.notification
            ? this.notificationService.sendNotification(input.notification)
            : null;

        if (notificationResult) {
            memory.lastNotification = notificationResult.message;
        }

        const persistedMemory = this.persistMemory(memory, input.projectRoot ?? null);
        const report = this.reportGenerator.createReport({
            commandsProcessed: memory.commandsExecuted,
            notificationsSent: notificationResult ? 1 : 0,
            activeUsers: memory.authorizedUsers.length,
            authorizedUsers: memory.authorizedUsers,
            lastCommand: received.command,
            lastNotification: notificationResult
        });
        const persistedReport = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            status: "OK",
            command: received,
            authorization,
            response: commandResult,
            approvalAction: approvalActionResult,
            notification: notificationResult,
            memory: persistedMemory.memory,
            memoryPath: persistedMemory.path,
            report,
            reportPath: persistedReport.path
        };
    }
}
