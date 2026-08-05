// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-7.1
// Execution Job Contract
// ───────────────────────────────────────────────────────────────

export default class ExecutionJob {

    constructor(data = {}) {

        this.jobId = data.jobId ?? null;

        this.planId = data.planId ?? null;

        this.projectId = data.projectId ?? null;

        this.taskId = data.taskId ?? null;

        this.worker = data.worker ?? "";

        this.status = data.status ?? "PENDING";

        this.priority = data.priority ?? "NORMAL";

        this.payload = data.payload ?? {};

        this.result = data.result ?? null;

        this.error = data.error ?? null;

        this.createdAt =
            data.createdAt ??
            new Date().toISOString();

        this.updatedAt =
            data.updatedAt ??
            new Date().toISOString();

    }

    toJSON() {

        return {

            ...this

        };

    }

}