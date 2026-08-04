// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.4.1
// Engineering Decision Contract
// ───────────────────────────────────────────────────────────────

export default class EngineeringDecision {

    constructor(data = {}) {

        this.decisionId = data.decisionId ?? null;

        this.recommendationId = data.recommendationId ?? null;

        this.projectId = data.projectId ?? null;

        this.approved = data.approved ?? false;

        this.approvalReason = data.approvalReason ?? "";

        this.governanceChecks = data.governanceChecks ?? [];

        this.architectureChecks = data.architectureChecks ?? [];

        this.securityChecks = data.securityChecks ?? [];

        this.riskScore = data.riskScore ?? 0;

        this.estimatedCost = data.estimatedCost ?? "";

        this.estimatedTimeline = data.estimatedTimeline ?? "";

        this.decisionConfidence = data.decisionConfidence ?? 0;

        this.generatedAt = data.generatedAt ?? new Date().toISOString();

    }

    toJSON() {

        return {

            ...this

        };

    }

}