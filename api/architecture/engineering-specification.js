// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 15.1
// Engineering Specification
// Master Engineering Blueprint
// ───────────────────────────────────────────────────────────────

export default class EngineeringSpecification {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.specificationId =
            data.specificationId ??
            `SPEC-${Date.now()}`;

        this.version =
            data.version ??
            "1.0.0";

        this.createdAt =
            data.createdAt ??
            new Date().toISOString();

        // ------------------------------------------------------
        // Project
        // ------------------------------------------------------

        this.project = {

            id:
                data.project?.id ?? "",

            name:
                data.project?.name ?? "",

            description:
                data.project?.description ?? "",

            domain:
                data.project?.domain ?? "",

            type:
                data.project?.type ?? ""

        };

        // ------------------------------------------------------
        // Business
        // ------------------------------------------------------

        this.businessGoals =
            data.businessGoals ?? [];

        this.functionalRequirements =
            data.functionalRequirements ?? [];

        this.nonFunctionalRequirements =
            data.nonFunctionalRequirements ?? [];

        // ------------------------------------------------------
        // Architecture
        // ------------------------------------------------------

        this.architecture =
            data.architecture ?? {};

        // ------------------------------------------------------
        // Engineering
        // ------------------------------------------------------

        this.frontend =
            data.frontend ?? {};

        this.backend =
            data.backend ?? {};

        this.database =
            data.database ?? {};

        this.api =
            data.api ?? {};

        this.integrations =
            data.integrations ?? [];

        // ------------------------------------------------------
        // Quality
        // ------------------------------------------------------

        this.security =
            data.security ?? {};

        this.testing =
            data.testing ?? {};

        this.performance =
            data.performance ?? {};

        this.accessibility =
            data.accessibility ?? {};

        // ------------------------------------------------------
        // DevOps
        // ------------------------------------------------------

        this.deployment =
            data.deployment ?? {};

        this.infrastructure =
            data.infrastructure ?? {};

        // ------------------------------------------------------
        // Engineering Governance
        // ------------------------------------------------------

        this.constraints =
            data.constraints ?? [];

        this.risks =
            data.risks ?? [];

        this.assumptions =
            data.assumptions ?? [];

        this.acceptanceCriteria =
            data.acceptanceCriteria ?? [];

        this.successMetrics =
            data.successMetrics ?? [];

        // ------------------------------------------------------
        // Traceability
        // ------------------------------------------------------

        this.relatedPlans =
            data.relatedPlans ?? [];

        this.relatedWorkflows =
            data.relatedWorkflows ?? [];

        this.relatedExecutions =
            data.relatedExecutions ?? [];

    }

}