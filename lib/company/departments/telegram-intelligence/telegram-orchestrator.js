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
        this.runtime = null;
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

    async startRuntime(input = {}) {
        const bootstrap = this.client.initialize();
        if (!this.client.isConfigured()) {
            this.runtime = {
                status: "DISABLED",
                reason: "TELEGRAM_BOT_TOKEN_MISSING",
                bootstrap
            };
            return this.runtime;
        }

        if (this.runtime?.status === "RUNNING") {
            return this.runtime;
        }

        this.runtime = await this.client.startPolling({
            interval: Number(input.pollInterval ?? process.env.TELEGRAM_POLL_INTERVAL ?? 1000),
            keepAlive: Boolean(input.keepAlive),
            onUpdate: async (update) => {
                await this.handleUpdate(update, input);
            },
            onError: async (error) => {
                this.runtime = {
                    ...(this.runtime ?? {}),
                    status: "ERROR",
                    reason: error?.message ?? String(error),
                    lastError: error?.message ?? String(error)
                };
            }
        });

        return this.runtime;
    }

    stopRuntime() {
        this.client.stopPolling();
        this.runtime = {
            status: "STOPPED"
        };
        return this.runtime;
    }

    async handleUpdate(update = {}, input = {}) {
        const message = update.message ?? update.edited_message ?? update.channel_post ?? null;
        if (!message) {
            return {
                status: "IGNORED"
            };
        }

        const text = String(message.text ?? "").trim();
        if (!text.startsWith("/")) {
            return {
                status: "IGNORED"
            };
        }

        const [command, ...rest] = text.split(/\s+/);
        const result = this.processMessage({
            message: {
                userId: String(message.from?.id ?? message.chat?.id ?? ""),
                command,
                args: rest.join(" ").trim(),
                text,
                chatId: message.chat?.id ?? null,
                receivedAt: new Date().toISOString()
            },
            projectRoot: input.projectRoot ?? null,
            companyReport: input.companyReport ?? {},
            telegramReport: input.telegramReport ?? {},
            ceoSummary: input.ceoSummary ?? {},
            emailDepartment: input.emailDepartment ?? null,
            context: {
                ...(input.context ?? {}),
                chatId: message.chat?.id ?? null,
                telegramUserId: String(message.from?.id ?? "")
            },
            approvalId: input.approvalId ?? null,
            messageContent: input.messageContent ?? null,
            notification: input.notification ?? null
        });

        const responseText = result?.response?.message
            ?? (result?.response?.status === "ACCESS_DENIED" ? "ACCESS_DENIED" : null);

        if (responseText && message.chat?.id != null) {
            await this.client.sendMessage({
                chatId: message.chat.id,
                text: responseText
            });
        }

        return result;
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
