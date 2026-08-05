// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.1
// Executable Workflow Contract
// Runtime Execution Model
// ───────────────────────────────────────────────────────────────

export default class ExecutableWorkflow {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.workflowId =
            data.workflowId ?? null;

        this.projectId =
            data.projectId ?? null;

        this.planId =
            data.planId ?? null;

        // ------------------------------------------------------
        // Runtime Status
        // ------------------------------------------------------

        this.status =
            data.status ?? "pending";

        this.currentStage =
            data.currentStage ?? 1;

        // ------------------------------------------------------
        // Execution Stages
        // ------------------------------------------------------

        this.stages =
            data.stages ?? [];

        // ------------------------------------------------------
        // Runtime Queues
        // ------------------------------------------------------

        this.pendingTasks =
            data.pendingTasks ?? [];

        this.activeTasks =
            data.activeTasks ?? [];

        this.completedTasks =
            data.completedTasks ?? [];

        this.failedTasks =
            data.failedTasks ?? [];

        // ------------------------------------------------------
        // Metrics
        // ------------------------------------------------------

        this.progress =
            data.progress ?? 0;

        this.totalTasks =
            data.totalTasks ?? 0;

        this.completedCount =
            data.completedCount ?? 0;

        this.failedCount =
            data.failedCount ?? 0;

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.createdAt =
            data.createdAt ??
            new Date().toISOString();

        this.updatedAt =
            data.updatedAt ??
            this.createdAt;

    }

    toJSON() {

        return {

            ...this

        };

    }

}