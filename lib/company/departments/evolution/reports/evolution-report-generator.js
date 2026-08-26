import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class EvolutionReportGenerator {
    createReport(input = {}) {
        const scores = [
            input.technology?.score ?? 0,
            input.market?.score ?? 0,
            input.product?.score ?? 0,
            input.performance?.score ?? 0,
            input.security?.score ?? 0,
            input.ai?.score ?? 0,
            input.recommendation?.score ?? 0,
            input.roadmap?.score ?? 0
        ];
        const evolutionScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

        return {
            reportId: `EVOLREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            projectName: input.projectName ?? null,
            evolutionScore,
            softwareHealth: evolutionScore >= 95 ? "EXCELLENT" : "GOOD",
            technologyScore: input.technology?.score ?? 0,
            productScore: input.product?.score ?? 0,
            performanceScore: input.performance?.score ?? 0,
            securityScore: input.security?.score ?? 0,
            aiImprovementScore: input.ai?.score ?? 0,
            recommendedActions: input.recommendation?.recommendedActions ?? 0,
            futureRoadmap: input.roadmap ?? null,
            evolutionConfidenceScore: evolutionScore,
            priority: input.recommendation?.priority ?? "HIGH",
            nextEvolutionCycle: input.roadmap?.nextEvolutionCycle ?? "READY",
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot, details = {}) {
        if (!projectRoot) {
            return { report, paths: null };
        }

        const reportDir = path.join(projectRoot, "reports", "company", "evolution");
        const paths = {
            technology: path.join(reportDir, "technology-evolution-report.json"),
            market: path.join(reportDir, "market-evolution-report.json"),
            product: path.join(reportDir, "product-evolution-report.json"),
            performance: path.join(reportDir, "performance-evolution-report.json"),
            security: path.join(reportDir, "security-evolution-report.json"),
            ai: path.join(reportDir, "ai-improvement-report.json"),
            recommendation: path.join(reportDir, "evolution-recommendations.json"),
            roadmap: path.join(reportDir, "evolution-roadmap.json"),
            certification: path.join(reportDir, "software-evolution-report.json")
        };

        writeJson(paths.technology, details.technology ?? {});
        writeJson(paths.market, details.market ?? {});
        writeJson(paths.product, details.product ?? {});
        writeJson(paths.performance, details.performance ?? {});
        writeJson(paths.security, details.security ?? {});
        writeJson(paths.ai, details.ai ?? {});
        writeJson(paths.recommendation, details.recommendation ?? {});
        writeJson(paths.roadmap, details.roadmap ?? {});
        writeJson(paths.certification, report);

        return { report, paths };
    }
}
