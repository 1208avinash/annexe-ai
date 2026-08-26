import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class SecurityReportGenerator {
    createReport(input = {}) {
        const scores = [
            input.audit?.score ?? 0,
            input.application?.score ?? 0,
            input.dependency?.score ?? 0,
            input.compliance?.score ?? 0,
            input.privacy?.score ?? 0,
            input.penetration?.score ?? 0
        ];
        const securityScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        const status = securityScore >= 95 ? "APPROVED" : "REVIEW";

        return {
            reportId: `SECREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            projectName: input.projectName ?? null,
            securityScore,
            status,
            vulnerabilities: (input.audit?.architectureRisks?.length ?? 0) + (input.dependency?.vulnerablePackages?.length ?? 0),
            compliance: input.compliance?.status ?? "REVIEW",
            privacy: input.privacy?.status ?? "REVIEW",
            penetration: input.penetration?.status ?? "REVIEW",
            recommendation: status === "APPROVED" ? "DEPLOY" : "HARDEN",
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot, details = {}) {
        if (!projectRoot) {
            return { report, paths: null };
        }

        const reportDir = path.join(projectRoot, "reports", "company", "security");
        const paths = {
            audit: path.join(reportDir, "security-audit-report.json"),
            application: path.join(reportDir, "application-security-report.json"),
            dependency: path.join(reportDir, "dependency-security-report.json"),
            compliance: path.join(reportDir, "compliance-report.json"),
            privacy: path.join(reportDir, "privacy-report.json"),
            penetration: path.join(reportDir, "penetration-test-report.json"),
            certification: path.join(reportDir, "security-certification-report.json")
        };

        writeJson(paths.audit, details.audit ?? {});
        writeJson(paths.application, details.application ?? {});
        writeJson(paths.dependency, details.dependency ?? {});
        writeJson(paths.compliance, details.compliance ?? {});
        writeJson(paths.privacy, details.privacy ?? {});
        writeJson(paths.penetration, details.penetration ?? {});
        writeJson(paths.certification, report);

        return { report, paths };
    }
}
