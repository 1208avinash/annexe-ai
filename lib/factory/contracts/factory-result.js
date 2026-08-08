// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 20.3
// Factory Result Contract
// Standard Output For Software Factory Operations
// ───────────────────────────────────────────────────────────────

export default class FactoryResult {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.resultId =
            data.resultId ??
            `RESULT-${Date.now()}`;

        this.requestId =
            data.requestId ?? "";

        this.requestType =
            data.requestType ?? "";

        // ------------------------------------------------------
        // Status
        // ------------------------------------------------------

        this.success =
            data.success ?? false;

        this.status =
            data.status ?? "pending";

        // ------------------------------------------------------
        // Execution
        // ------------------------------------------------------

        this.projectId =
            data.projectId ?? "";

        this.workflowId =
            data.workflowId ?? "";

        this.executionId =
            data.executionId ?? "";

        // ------------------------------------------------------
        // Output
        // ------------------------------------------------------

        this.generatedFiles =
            data.generatedFiles ?? [];

        this.artifacts =
            data.artifacts ?? [];

        // ------------------------------------------------------
        // Metrics
        // ------------------------------------------------------

        this.metrics = {

            engineers:
                data.metrics?.engineers ?? 0,

            tasks:
                data.metrics?.tasks ?? 0,

            completedTasks:
                data.metrics?.completedTasks ?? 0,

            failedTasks:
                data.metrics?.failedTasks ?? 0,

            generatedFiles:
                data.metrics?.generatedFiles ?? 0

        };

        // ------------------------------------------------------
        // Errors
        // ------------------------------------------------------

        this.errors =
            data.errors ?? [];

        // ------------------------------------------------------
        // Timing
        // ------------------------------------------------------

        this.startedAt =
            data.startedAt ??
            null;

        this.completedAt =
            data.completedAt ??
            null;

        this.durationMs =
            data.durationMs ??
            0;

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

}