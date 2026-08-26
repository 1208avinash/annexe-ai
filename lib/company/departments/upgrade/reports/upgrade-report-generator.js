import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class UpgradeReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `UPGRADEREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            requestedUpgrade: input.requestText ?? "",
            analysis: input.analysis ?? null,
            impact: input.impact ?? null,
            cost: input.cost ?? null,
            paymentStatus: input.paymentGate?.paymentStatus ?? "PENDING",
            executionStatus: input.execution?.executionStatus ?? "BLOCKED",
            validationResult: input.validation ?? null,
            completionStatus: input.validation?.status === "PASS" ? "COMPLETED" : "PENDING",
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot, details = {}) {
        if (!projectRoot) {
            return { report, paths: null };
        }

        const reportDir = path.join(projectRoot, "reports", "company", "upgrade");
        const paths = {
            analysis: path.join(reportDir, "upgrade-analysis-report.json"),
            impact: path.join(reportDir, "upgrade-impact-report.json"),
            plan: path.join(reportDir, "upgrade-plan.json"),
            cost: path.join(reportDir, "upgrade-cost-estimate.json"),
            paymentGate: path.join(reportDir, "upgrade-payment-gate.json"),
            execution: path.join(reportDir, "upgrade-execution-report.json"),
            validation: path.join(reportDir, "upgrade-validation-report.json"),
            certification: path.join(reportDir, "upgrade-lifecycle-report.json")
        };

        writeJson(paths.analysis, details.analysis ?? {});
        writeJson(paths.impact, details.impact ?? {});
        writeJson(paths.plan, details.plan ?? {});
        writeJson(paths.cost, details.cost ?? {});
        writeJson(paths.paymentGate, details.paymentGate ?? {});
        writeJson(paths.execution, details.execution ?? {});
        writeJson(paths.validation, details.validation ?? {});
        writeJson(paths.certification, report);

        return { report, paths };
    }
}
