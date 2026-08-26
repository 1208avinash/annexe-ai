import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class MailboxSyncReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `IMAP-SYNC-${Date.now()}`,
            mailbox: String(input.mailbox ?? ""),
            emailsRead: Number(input.emailsRead ?? 0),
            processed: Number(input.processed ?? 0),
            failed: Number(input.failed ?? 0),
            lastSync: String(input.lastSync ?? ""),
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "mailbox-sync-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
