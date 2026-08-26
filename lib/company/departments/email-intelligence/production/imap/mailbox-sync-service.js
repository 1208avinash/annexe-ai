import fs from "fs";
import path from "path";

import EmailOrchestrator from "../../email-orchestrator.js";
import ImapClient from "./imap-client.js";
import MailboxReaderService from "./mailbox-reader-service.js";
import ImapSecurityWrapper from "./imap-security-wrapper.js";
import TelegramNotificationService from "../../../telegram-intelligence/bot/notification-service.js";
import MailboxSyncReportGenerator from "../../reports/mailbox-sync-report-generator.js";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultState() {
    return {
        lastSync: "",
        processedIds: []
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

export default class MailboxSyncService {
    constructor({
        client = new ImapClient(),
        readerService = new MailboxReaderService({ client }),
        securityWrapper = new ImapSecurityWrapper(),
        emailOrchestrator = new EmailOrchestrator(),
        telegramNotificationService = new TelegramNotificationService(),
        reportGenerator = new MailboxSyncReportGenerator()
    } = {}) {
        this.client = client;
        this.readerService = readerService;
        this.securityWrapper = securityWrapper;
        this.emailOrchestrator = emailOrchestrator;
        this.telegramNotificationService = telegramNotificationService;
        this.reportGenerator = reportGenerator;
    }

    loadState(projectRoot = null) {
        if (!projectRoot) {
            return defaultState();
        }

        const filePath = path.join(projectRoot, "memory", "mailbox-sync-state.json");
        const state = readJson(filePath);
        return state ?? defaultState();
    }

    persistState(state = defaultState(), projectRoot = null) {
        if (!projectRoot) {
            return { state, path: null };
        }

        const filePath = path.join(projectRoot, "memory", "mailbox-sync-state.json");
        writeJson(filePath, state);
        return { state, path: filePath };
    }

    createTelegramNotification(emailResult = {}, email = {}, telegramNotificationService = this.telegramNotificationService) {
        if (!telegramNotificationService || typeof telegramNotificationService.sendNotification !== "function") {
            return null;
        }

        const category = String(emailResult?.classification?.category ?? emailResult?.route?.department ?? "GENERAL").toUpperCase();
        const typeMap = {
            SALES: "Sales Opportunity",
            SUPPORT: "Support Alert",
            SECURITY: "Security Alert",
            BILLING: "Billing Alert"
        };

        return telegramNotificationService.sendNotification({
            type: typeMap[category] ?? "AI CEO Brief",
            customer: email.from ?? emailResult?.customerContext?.company ?? "",
            action: emailResult?.reply?.status === "DRAFT" ? "Review draft reply" : "Review email intelligence"
        });
    }

    sync(input = {}) {
        const telegramNotificationService = input.telegramNotificationService ?? this.telegramNotificationService;
        const connection = input.connection ?? this.client.connect(input.config ?? {});
        const readResult = this.readerService.readMailbox({
            connection,
            messages: input.messages ?? input.mockMessages ?? []
        });
        const state = this.loadState(input.projectRoot ?? null);
        const processedIds = new Set(Array.isArray(state.processedIds) ? state.processedIds : []);
        const processed = [];
        const failed = [];
        const notifications = [];

        if (!connection.connected) {
            const report = this.reportGenerator.createReport({
                mailbox: connection.mailbox ?? "",
                emailsRead: 0,
                processed: 0,
                failed: 0,
                lastSync: state.lastSync ?? ""
            });
            const persistedReport = this.reportGenerator.persist(report, input.projectRoot ?? null);
            const persistedState = this.persistState(state, input.projectRoot ?? null);

            return {
                status: "NOT_READY",
                connection,
                readResult,
                processed,
                failed,
                notifications,
                state: persistedState.state,
                statePath: persistedState.path,
                report: persistedReport.report,
                reportPath: persistedReport.path
            };
        }

        for (const email of readResult.messages ?? []) {
            if (processedIds.has(email.id)) {
                continue;
            }

            const security = this.securityWrapper.evaluate({ message: email });
            if (security.action !== "PROCESS") {
                failed.push({
                    email,
                    security
                });
                continue;
            }

            const emailResult = this.emailOrchestrator.processIncomingEmail({
                email,
                projectRoot: input.projectRoot ?? null,
                project: input.project ?? null
            });
            const notification = this.createTelegramNotification(emailResult, email, telegramNotificationService);

            if (notification) {
                notifications.push(notification);
            }

            processedIds.add(email.id);
            processed.push({
                email,
                security,
                emailResult,
                notification
            });
        }

        state.lastSync = new Date().toISOString();
        state.processedIds = Array.from(processedIds);

        const persistedState = this.persistState(state, input.projectRoot ?? null);
        const report = this.reportGenerator.createReport({
            mailbox: connection.mailbox ?? connection.user ?? "",
            emailsRead: (readResult.messages ?? []).length,
            processed: processed.length,
            failed: failed.length,
            lastSync: state.lastSync
        });
        const persistedReport = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            status: "SYNCED",
            connection,
            readResult,
            processed,
            failed,
            notifications,
            state: persistedState.state,
            statePath: persistedState.path,
            report: persistedReport.report,
            reportPath: persistedReport.path
        };
    }
}
