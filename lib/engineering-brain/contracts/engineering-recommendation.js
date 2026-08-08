// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.3.1
// Engineering Recommendation Contract
// ───────────────────────────────────────────────────────────────

export default class EngineeringRecommendation {

    constructor(data = {}) {

        this.recommendationId = data.recommendationId ?? null;

        this.projectId = data.projectId ?? null;

        this.executiveSummary = data.executiveSummary ?? "";

        this.architecture = data.architecture ?? "";

        this.backend = data.backend ?? "";

        this.frontend = data.frontend ?? "";

        this.mobile = data.mobile ?? "";

        this.database = data.database ?? "";

        this.infrastructure = data.infrastructure ?? [];

        this.integrations = data.integrations ?? [];

        this.reusableComponents = data.reusableComponents ?? [];

        this.engineeringPatterns = data.engineeringPatterns ?? [];

        this.security = data.security ?? [];

        this.scalability = data.scalability ?? "";

        this.estimatedComplexity = data.estimatedComplexity ?? "";

        this.estimatedTimeline = data.estimatedTimeline ?? "";

        this.engineeringRisks = data.engineeringRisks ?? [];

        this.alternatives = data.alternatives ?? [];

        this.evidence = data.evidence ?? [];

        this.reasoning = data.reasoning ?? "";

        this.confidence = data.confidence ?? 0;

        this.generatedAt = data.generatedAt ?? new Date().toISOString();

    }

    toJSON() {

        return {

            ...this

        };

    }

}