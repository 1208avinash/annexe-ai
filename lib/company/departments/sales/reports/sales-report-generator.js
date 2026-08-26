import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class SalesReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `SALES-${Date.now()}`,
            projectId: input.projectId ?? null,
            leadScore: input.leadAnalysis?.leadScore ?? null,
            customerAnalysis: input.discovery ?? null,
            proposalSummary: input.proposal ?? null,
            revenueEstimate: input.forecast?.expectedRevenue ?? null,
            recommendedNextAction: input.leadAnalysis?.recommendedAction ?? "Run discovery",
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "sales", "sales-intelligence-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
