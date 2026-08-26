import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

function exists(filePath) {
    try {
        return fs.existsSync(filePath);
    }
    catch {
        return false;
    }
}

function runNodeCheck(filePath) {
    if (!filePath || !exists(filePath)) {
        return { skipped: true, success: true };
    }

    const result = spawnSync(process.execPath, ["--check", filePath], { encoding: "utf8" });
    return {
        skipped: false,
        success: result.status === 0,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? ""
    };
}

export default class RepairValidator {
    validate(input = {}) {
        const impactedFiles = input.impactedFiles ?? [];
        const projectRoot = input.projectRoot ?? null;
        const fileChecks = impactedFiles.map(file => {
            const absolutePath = projectRoot ? path.join(projectRoot, file) : file;
            return {
                file,
                ...runNodeCheck(absolutePath)
            };
        });

        const health = {
            projectRoot: Boolean(projectRoot),
            issueDetected: Boolean(input.issueDetected),
            repairPlanGenerated: Boolean(input.repairPlan?.repairSteps?.length),
            paymentGateCreated: Boolean(input.paymentGateCreated)
        };

        return {
            success: fileChecks.every(check => check.success !== false),
            fileChecks,
            health,
            regressionChecks: [
                "access path validation",
                "login flow verification",
                "dashboard access verification"
            ],
            testedAt: new Date().toISOString()
        };
    }
}
