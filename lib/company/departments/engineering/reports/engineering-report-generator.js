import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class EngineeringReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `ENGREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            assignedEngineers: input.assignedEngineers ?? [],
            implementationPlans: input.implementationPlans ?? {},
            reviewResults: input.reviewResults ?? null,
            performanceAnalysis: input.performanceAnalysis ?? null,
            recommendations: input.recommendations ?? [],
            confidenceScore: input.confidenceScore ?? 95,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "engineering", "engineering-execution-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
