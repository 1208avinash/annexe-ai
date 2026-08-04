// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.5.1
// Engineering Plan Contract
// ───────────────────────────────────────────────────────────────

export default class EngineeringPlan {

    constructor(data = {}) {

        this.planId = data.planId ?? null;

        this.decisionId = data.decisionId ?? null;

        this.projectId = data.projectId ?? null;

        this.title = data.title ?? "";

        this.summary = data.summary ?? "";

        this.milestones = data.milestones ?? [];

        this.engineeringTasks = data.engineeringTasks ?? [];

        this.dependencies = data.dependencies ?? [];

        this.executionOrder = data.executionOrder ?? [];

        this.estimatedDuration = data.estimatedDuration ?? "";

        this.estimatedCost = data.estimatedCost ?? "";

        this.recommendedTeam = data.recommendedTeam ?? [];

        this.risks = data.risks ?? [];

        this.generatedAt = data.generatedAt ?? new Date().toISOString();

    }

    toJSON() {

        return {

            ...this

        };

    }

}