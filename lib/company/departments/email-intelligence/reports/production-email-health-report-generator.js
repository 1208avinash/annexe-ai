import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class ProductionEmailHealthReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `EMAIL-PROD-${Date.now()}`,
            status: input.status ?? "NOT_READY",
            mailbox: input.mailbox ?? "",
            security: input.security ?? {},
            audit: input.audit ?? {},
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "production-email-health-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
