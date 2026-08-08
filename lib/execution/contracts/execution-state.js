// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.2
// Execution State Contract
// Runtime Heartbeat of the Software Factory
// ───────────────────────────────────────────────────────────────

export default class ExecutionState {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.executionId =
            data.executionId ?? null;

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

        this.currentTask =
            data.currentTask ?? null;

        this.currentWorker =
            data.currentWorker ?? null;

        // ------------------------------------------------------
        // Progress
        // ------------------------------------------------------

        this.totalTasks =
            data.totalTasks ?? 0;

        this.completedTasks =
            data.completedTasks ?? 0;

        this.failedTasks =
            data.failedTasks ?? 0;

        this.progress =
            data.progress ?? 0;

        // ------------------------------------------------------
        // Runtime Metrics
        // ------------------------------------------------------

        this.startedAt =
            data.startedAt ?? null;

        this.completedAt =
            data.completedAt ?? null;

        this.lastUpdated =
            data.lastUpdated ??
            new Date().toISOString();

        // ------------------------------------------------------
        // Runtime Events
        // ------------------------------------------------------

        this.history =
            data.history ?? [];

        this.errors =
            data.errors ?? [];

    }

    toJSON() {

        return {

            ...this

        };

    }

}