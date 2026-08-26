import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class QAReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `QAREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            functionalScore: input.functional?.score ?? 0,
            apiScore: input.api?.score ?? 0,
            securityScore: input.security?.score ?? 0,
            performanceScore: input.performance?.score ?? 0,
            accessibilityScore: input.accessibility?.score ?? 0,
            regressionScore: input.regression?.score ?? 0,
            qualityScore: input.releaseDecision?.qualityScore ?? 0,
            status: input.releaseDecision?.status ?? "REJECTED",
            releaseRecommendation: input.releaseDecision?.releaseRecommendation ?? "HOLD",
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot, details = {}) {
        if (!projectRoot) {
            return { report, paths: null };
        }

        const reportDir = path.join(projectRoot, "reports", "company", "qa");
        const paths = {
            functional: path.join(reportDir, "functional-test-report.json"),
            api: path.join(reportDir, "api-test-report.json"),
            security: path.join(reportDir, "security-test-report.json"),
            performance: path.join(reportDir, "performance-test-report.json"),
            accessibility: path.join(reportDir, "accessibility-test-report.json"),
            regression: path.join(reportDir, "regression-test-report.json"),
            release: path.join(reportDir, "release-decision.json"),
            certification: path.join(reportDir, "quality-certification-report.json")
        };

        writeJson(paths.functional, details.functional ?? {});
        writeJson(paths.api, details.api ?? {});
        writeJson(paths.security, details.security ?? {});
        writeJson(paths.performance, details.performance ?? {});
        writeJson(paths.accessibility, details.accessibility ?? {});
        writeJson(paths.regression, details.regression ?? {});
        writeJson(paths.release, details.releaseDecision ?? {});
        writeJson(paths.certification, report);

        return { report, paths };
    }
}
