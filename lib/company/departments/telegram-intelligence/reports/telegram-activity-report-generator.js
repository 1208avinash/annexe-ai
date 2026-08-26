import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultReport() {
    return {
        commandsProcessed: 0,
        notificationsSent: 0,
        activeUsers: 0
    };
}

export default class TelegramActivityReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `TELEGRAM-${Date.now()}`,
            commandsProcessed: Number(input.commandsProcessed ?? 0),
            notificationsSent: Number(input.notificationsSent ?? 0),
            activeUsers: Number(input.activeUsers ?? 0),
            authorizedUsers: input.authorizedUsers ?? [],
            lastCommand: input.lastCommand ?? null,
            lastNotification: input.lastNotification ?? null,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "telegram", "telegram-activity-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
