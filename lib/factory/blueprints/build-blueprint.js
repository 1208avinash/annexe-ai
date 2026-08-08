// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 21.5
// Build Blueprint
// Executable Project Blueprint
// ───────────────────────────────────────────────────────────────

export default class BuildBlueprint {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.blueprintId =
            data.blueprintId ??
            `BLUEPRINT-${Date.now()}`;

        this.templateId =
            data.templateId ?? "";

        this.projectId =
            data.projectId ?? "";

        // ------------------------------------------------------
        // Architecture
        // ------------------------------------------------------

        this.architecture =
            data.architecture ?? {};

        // ------------------------------------------------------
        // Business
        // ------------------------------------------------------

        this.modules =
            data.modules ?? [];

        this.entities =
            data.entities ?? [];

        this.services =
            data.services ?? [];

        this.apis =
            data.apis ?? [];

        this.roles =
            data.roles ?? [];

        this.workflows =
            data.workflows ?? [];

        // ------------------------------------------------------
        // Engineering
        // ------------------------------------------------------

        this.engineeringTasks =
            data.engineeringTasks ?? [];

        this.dependencies =
            data.dependencies ?? [];

        // ------------------------------------------------------
        // Deployment
        // ------------------------------------------------------

        this.deployment =
            data.deployment ?? {};

        // ------------------------------------------------------
        // Quality
        // ------------------------------------------------------

        this.testing =
            data.testing ?? [];

        this.documentation =
            data.documentation ?? [];

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

        // ------------------------------------------------------
        // Compilation Output
        // ------------------------------------------------------

        this.engineeringPlan =
            data.engineeringPlan ?? null;

        this.files =
            data.files ?? [];

        // ------------------------------------------------------
        // Project Structure
        // ------------------------------------------------------

        this.structure =
            data.structure ?? {};

        this.stackMetadata =
            data.stackMetadata ?? {};

        this.requiredFiles =
            data.requiredFiles ?? [];

        this.directories =
            data.directories ?? [];

        this.businessModules =
            data.businessModules ?? {};

        // ------------------------------------------------------
        // Capabilities
        // ------------------------------------------------------

        this.capabilities =
            data.capabilities ?? [];

        this.capabilityRegistry =
            data.capabilityRegistry ?? {};

        this.applicationAssembly =
            data.applicationAssembly ?? null;

    }

}
