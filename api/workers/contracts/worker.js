// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.3
// Worker Contract
// Base Contract for Every Software Factory Worker
// ───────────────────────────────────────────────────────────────

export default class Worker {

    constructor(config = {}) {

        this.workerId =
            config.workerId ??
            `WORKER-${Date.now()}`;

        this.workerType =
            config.workerType ?? "Generic Worker";

        this.version =
            config.version ?? "1.0.0";

        this.capabilities =
            config.capabilities ?? [];

    }

    /**
     * Execute a task.
     * Every worker MUST implement this method.
     */
    async execute(task, executionState) {

        throw new Error(

            `${this.workerType} must implement execute(task, executionState).`

        );

    }

    /**
     * Standard success response.
     */
    success(task, executionState, data = {}) {

        return {

            success: true,

            workerId: this.workerId,

            workerType: this.workerType,

            taskId: task?.taskId ?? task?.id ?? null,

            executionId:
                executionState?.executionId ?? null,

            status: "completed",

            artifacts:
                data.artifacts ?? [],

            logs:
                data.logs ?? [],

            metrics:
                data.metrics ?? {},

            updatedExecutionState:
                executionState

        };

    }

    /**
     * Standard failure response.
     */
    failure(task, executionState, error) {

        return {

            success: false,

            workerId: this.workerId,

            workerType: this.workerType,

            taskId: task?.taskId ?? task?.id ?? null,

            executionId:
                executionState?.executionId ?? null,

            status: "failed",

            error:
                error?.message ?? String(error),

            updatedExecutionState:
                executionState

        };

    }

}