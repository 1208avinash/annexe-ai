import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class CEOReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `CEO-${Date.now()}`,
            projectId: input.projectId ?? null,
            projectName: input.projectName ?? null,
            industry: input.industry ?? null,
            marketAnalysis: input.marketAnalysis ?? null,
            strategy: input.strategy ?? null,
            financialForecast: input.financialForecast ?? null,
            riskAnalysis: input.riskAnalysis ?? null,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "ceo", "ceo-strategy-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
