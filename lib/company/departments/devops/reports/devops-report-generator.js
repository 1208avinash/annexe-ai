import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class DevOpsReportGenerator {
    createReport(input = {}) {
        const scores = [
            input.deployment?.score ?? 0,
            input.cloudOperations?.score ?? 0,
            input.monitoring?.score ?? 0,
            input.incidentResponse?.score ?? 0,
            input.scaling?.score ?? 0,
            input.recovery?.score ?? 0,
            input.optimization?.score ?? 0
        ];
        const operationsScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        const status = operationsScore >= 95 ? "APPROVED" : "REVIEW";

        return {
            reportId: `DEVOPSREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            projectName: input.projectName ?? null,
            operationsScore,
            deployment: input.deployment?.deploymentPlan ?? "REVIEW",
            monitoring: input.monitoring?.monitoringStrategy ?? "REVIEW",
            scaling: input.scaling?.scalingPlan ?? "REVIEW",
            recovery: input.recovery?.disasterRecoveryPlan ?? "REVIEW",
            recommendation: status === "APPROVED" ? "DEPLOY" : "HOLD",
            status,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot, details = {}) {
        if (!projectRoot) {
            return { report, paths: null };
        }

        const reportDir = path.join(projectRoot, "reports", "company", "devops");
        const paths = {
            deployment: path.join(reportDir, "deployment-plan.json"),
            cloudOperations: path.join(reportDir, "cloud-operations-report.json"),
            monitoring: path.join(reportDir, "monitoring-strategy.json"),
            incidentResponse: path.join(reportDir, "incident-response-plan.json"),
            scaling: path.join(reportDir, "scaling-plan.json"),
            recovery: path.join(reportDir, "disaster-recovery-plan.json"),
            optimization: path.join(reportDir, "optimization-report.json"),
            certification: path.join(reportDir, "devops-operations-report.json")
        };

        writeJson(paths.deployment, details.deployment ?? {});
        writeJson(paths.cloudOperations, details.cloudOperations ?? {});
        writeJson(paths.monitoring, details.monitoring ?? {});
        writeJson(paths.incidentResponse, details.incidentResponse ?? {});
        writeJson(paths.scaling, details.scaling ?? {});
        writeJson(paths.recovery, details.recovery ?? {});
        writeJson(paths.optimization, details.optimization ?? {});
        writeJson(paths.certification, report);

        return { report, paths };
    }
}
