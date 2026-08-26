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
        sent: 0,
        failed: 0,
        approvalsUsed: 0,
        lastSend: ""
    };
}

export default class EmailSendAuditReportGenerator {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultReport();
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-send-audit.json");
        if (!fs.existsSync(filePath)) {
            return defaultReport();
        }

        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return defaultReport();
        }
    }

    createReport(input = {}) {
        const report = this.load(input.projectRoot ?? null);
        report.sent += Number(input.sent ?? 0);
        report.failed += Number(input.failed ?? 0);
        report.approvalsUsed += Number(input.approvalsUsed ?? 0);
        report.lastSend = input.lastSend ?? report.lastSend ?? "";
        report.updatedAt = new Date().toISOString();
        return report;
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-send-audit.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
