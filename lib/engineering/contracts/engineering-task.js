// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 18.2
// Engineering Task Contract
// Standard Task Definition For All AI Engineers
// ───────────────────────────────────────────────────────────────

export default class EngineeringTask {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.taskId =
            data.taskId ??
            `TASK-${Date.now()}`;

        this.projectId =
            data.projectId ?? "";

        this.workflowId =
            data.workflowId ?? "";

        this.executionId =
            data.executionId ?? "";

        // ------------------------------------------------------
        // Description
        // ------------------------------------------------------

        this.title =
            data.title ?? "";

        this.description =
            data.description ?? "";

        this.category =
            data.category ?? "general";

        this.type =
            data.type ?? "implementation";

        // ------------------------------------------------------
        // Ownership
        // ------------------------------------------------------

        this.assignedEngineer =
            data.assignedEngineer ?? null;

        this.requiredRole =
            data.requiredRole ?? "";

        // ------------------------------------------------------
        // Priority
        // ------------------------------------------------------

        this.priority =
            data.priority ?? "normal";

        this.status =
            data.status ?? "pending";

        // ------------------------------------------------------
        // Dependencies
        // ------------------------------------------------------

        this.dependencies =
            data.dependencies ?? [];

        // ------------------------------------------------------
        // Inputs / Outputs
        // ------------------------------------------------------

        this.inputs =
            data.inputs ?? {};

        this.outputs =
            data.outputs ?? {};

        // ------------------------------------------------------
        // Requirements
        // ------------------------------------------------------

        this.requirements =
            data.requirements ?? [];

        this.acceptanceCriteria =
            data.acceptanceCriteria ?? [];

        // ------------------------------------------------------
        // Files
        // ------------------------------------------------------

        this.targetFiles =
            data.targetFiles ?? [];

        this.generatedFiles =
            data.generatedFiles ?? [];

        // ------------------------------------------------------
        // AI
        // ------------------------------------------------------

        this.preferredModel =
            data.preferredModel ?? null;

        this.preferredProvider =
            data.preferredProvider ?? null;

        this.freePreferred =
            data.freePreferred ?? true;

        // ------------------------------------------------------
        // Timing
        // ------------------------------------------------------

        this.createdAt =
            data.createdAt ??
            new Date().toISOString();

        this.startedAt =
            data.startedAt ?? null;

        this.completedAt =
            data.completedAt ?? null;

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

    // ----------------------------------------------------------
    // State Management
    // ----------------------------------------------------------

    start() {

        this.status = "running";

        this.startedAt =
            new Date().toISOString();

    }

    complete(outputs = {}) {

        this.status = "completed";

        this.outputs = outputs;

        this.completedAt =
            new Date().toISOString();

    }

    fail(reason = "") {

        this.status = "failed";

        this.metadata.failureReason =
            reason;

        this.completedAt =
            new Date().toISOString();

    }

}