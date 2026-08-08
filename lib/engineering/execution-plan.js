// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 15.3
// Execution Plan
// Engineering Specification → Executable Work Plan
// ───────────────────────────────────────────────────────────────

export default class ExecutionPlan {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.executionPlanId =
            data.executionPlanId ??
            `EPLAN-${Date.now()}`;

        this.version =
            data.version ??
            "1.0.0";

        this.createdAt =
            data.createdAt ??
            new Date().toISOString();

        // ------------------------------------------------------
        // Relationships
        // ------------------------------------------------------

        this.specificationId =
            data.specificationId ?? "";

        this.projectId =
            data.projectId ?? "";

        // ------------------------------------------------------
        // Execution Strategy
        // ------------------------------------------------------

        this.strategy =
            data.strategy ?? "parallel-where-possible";

        this.priority =
            data.priority ?? "normal";

        this.estimatedDuration =
            data.estimatedDuration ?? "";

        // ------------------------------------------------------
        // Execution Stages
        // ------------------------------------------------------

        this.stages =
            data.stages ?? [];

        // ------------------------------------------------------
        // Worker Allocation
        // ------------------------------------------------------

        this.requiredWorkers =
            data.requiredWorkers ?? [];

        // ------------------------------------------------------
        // Dependency Graph
        // ------------------------------------------------------

        this.dependencies =
            data.dependencies ?? [];

        // ------------------------------------------------------
        // Quality Gates
        // ------------------------------------------------------

        this.qualityGates =
            data.qualityGates ?? [

                "Implementation Complete",

                "Code Review",

                "Unit Tests",

                "Integration Tests",

                "Documentation",

                "Ready for Deployment"

            ];

        // ------------------------------------------------------
        // Risks
        // ------------------------------------------------------

        this.risks =
            data.risks ?? [];

        // ------------------------------------------------------
        // Metrics
        // ------------------------------------------------------

        this.totalStages =
            this.stages.length;

        this.totalWorkers =
            this.requiredWorkers.length;

    }

}