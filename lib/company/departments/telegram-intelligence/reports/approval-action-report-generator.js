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
        approvalsProcessed: 0,
        approved: 0,
        rejected: 0,
        edited: 0,
        authorizedUsers: []
    };
}

export default class ApprovalActionReportGenerator {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultReport();
        }

        const filePath = path.join(projectRoot, "reports", "company", "telegram", "approval-action-report.json");
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
        report.approvalsProcessed += Number(input.approvalsProcessed ?? 0);
        report.approved += Number(input.approved ?? 0);
        report.rejected += Number(input.rejected ?? 0);
        report.edited += Number(input.edited ?? 0);

        for (const userId of input.authorizedUsers ?? []) {
            if (!report.authorizedUsers.includes(userId)) {
                report.authorizedUsers.push(userId);
            }
        }

        report.updatedAt = new Date().toISOString();
        return report;
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "telegram", "approval-action-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
