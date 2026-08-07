// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 20.2
// Factory Request Contract
// Standard Request For Software Factory Operations
// ───────────────────────────────────────────────────────────────

export default class FactoryRequest {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.requestId =
            data.requestId ??
            `REQ-${Date.now()}`;

        this.requestType =
            data.requestType ??
            "buildSoftware";

        // ------------------------------------------------------
        // Customer
        // ------------------------------------------------------

        this.customer =
            data.customer ?? {};

        // ------------------------------------------------------
        // Project
        // ------------------------------------------------------

        this.project =
            data.project ?? {};

        // ------------------------------------------------------
        // Requirements
        // ------------------------------------------------------

        this.requirements =
            data.requirements ?? [];

        // ------------------------------------------------------
        // Existing Repository
        // ------------------------------------------------------

        this.repository =
            data.repository ?? null;

        // ------------------------------------------------------
        // Business
        // ------------------------------------------------------

        this.budget =
            data.budget ?? null;

        this.deadline =
            data.deadline ?? null;

        this.priority =
            data.priority ?? "normal";

        // ------------------------------------------------------
        // AI Preferences
        // ------------------------------------------------------

        this.ai = {

            freePreferred:
                data.ai?.freePreferred ?? true,

            paidAllowed:
                data.ai?.paidAllowed ?? true,

            preferredProvider:
                data.ai?.preferredProvider ?? null,

            preferredModel:
                data.ai?.preferredModel ?? null

        };

        // ------------------------------------------------------
        // Execution
        // ------------------------------------------------------

        this.status =
            data.status ?? "pending";

        this.createdAt =
            data.createdAt ??
            new Date().toISOString();

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

    // ----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------

    isNewProject() {

        return this.requestType === "buildSoftware";

    }

    isRepositoryProject() {

        return this.repository !== null;

    }

    isBugFix() {

        return this.requestType === "fixBug";

    }

    isFeatureRequest() {

        return this.requestType === "addFeature";

    }

    isDeployment() {

        return this.requestType === "deploy";

    }

}