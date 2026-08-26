import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class CommandCenterEmailReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `EMAIL-COMMAND-${Date.now()}`,
            dashboard: input.dashboard ?? {},
            approvals: input.approvals ?? {},
            customers: input.customers ?? {},
            employees: input.employees ?? {},
            latestEmail: input.latestEmail ?? null,
            latestEmployeeRouting: input.employeeRouting ?? null,
            latestIntent: input.intent ?? null,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "command-center-email-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
