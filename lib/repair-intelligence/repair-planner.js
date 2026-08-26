function estimateTimeline(severity, impactedFiles = []) {
    if (severity === "CRITICAL") {
        return {
            estimatedHours: Math.max(6, impactedFiles.length * 2),
            phases: ["Triage", "Fix", "Validate", "Deploy"]
        };
    }

    return {
        estimatedHours: Math.max(3, impactedFiles.length),
        phases: ["Diagnose", "Patch", "Validate"]
    };
}

function estimateCost(severity, impactedFiles = []) {
    const base = severity === "CRITICAL" ? 3200 : 1800;
    return base + impactedFiles.length * 250;
}

export default class RepairPlanner {
    plan(input = {}) {
        const diagnosis = input.diagnosis ?? {};
        const rootCause = input.rootCause ?? {};
        const impactedFiles = rootCause.impactedFiles ?? [];

        const repairSteps = [
            "Inspect the authentication regression.",
            "Reproduce the login failure.",
            "Patch the affected authentication path.",
            "Validate dashboard access for a customer session.",
            "Run regression checks and confirm recovery."
        ];

        return {
            repairSteps,
            timeline: estimateTimeline(diagnosis.severity, impactedFiles),
            costEstimate: estimateCost(diagnosis.severity, impactedFiles),
            affectedFiles: impactedFiles,
            priority: diagnosis.severity ?? "HIGH"
        };
    }
}
