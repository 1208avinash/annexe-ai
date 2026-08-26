import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class ProductReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `PRODREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            vision: input.strategy?.vision ?? null,
            roadmap: input.roadmap ?? null,
            priorities: input.priorities ?? [],
            userStories: input.userStories ?? [],
            acceptanceCriteria: input.acceptanceCriteria ?? [],
            recommendations: [
                "Ship the MVP first.",
                "Use high-priority features to anchor the roadmap.",
                "Align execution with validated customer and sales signals."
            ],
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "product", "product-strategy-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
