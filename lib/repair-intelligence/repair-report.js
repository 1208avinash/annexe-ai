import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, String(value ?? "") + "\n", "utf8");
}

export default class RepairReport {
    create(input = {}) {
        const report = {
            repairId: `RPR-${Date.now()}`,
            projectId: input.projectId ?? null,
            issueDetected: Boolean(input.issueDetected),
            diagnosis: input.diagnosis ?? null,
            rootCause: input.rootCause ?? null,
            plan: input.repairPlan ?? null,
            estimate: input.estimate ?? null,
            execution: input.execution ?? null,
            validation: input.validation ?? null,
            generatedAt: new Date().toISOString()
        };

        return report;
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, paths: null };
        }

        const reportDir = path.join(projectRoot, "reports", "repair");
        const paths = {
            json: path.join(reportDir, "repair-report.json"),
            markdown: path.join(reportDir, "repair-report.md")
        };

        writeJson(paths.json, report);
        writeText(paths.markdown, [
            "# Repair Report",
            "",
            `- Repair ID: ${report.repairId}`,
            `- Issue Detected: ${report.issueDetected}`,
            `- Category: ${report.diagnosis?.category ?? "UNKNOWN"}`,
            `- Severity: ${report.diagnosis?.severity ?? "UNKNOWN"}`,
            `- Cost Estimate: ${report.estimate?.costEstimate ?? 0}`,
            `- Payment Gate: ${report.estimate?.paymentGateCreated ? "Created" : "Missing"}`
        ].join("\n"));

        return { report, paths };
    }
}
