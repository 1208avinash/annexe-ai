// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 12.1
// Build Manifest Contract
// Engineering Output Transaction
// ───────────────────────────────────────────────────────────────

export default class BuildManifest {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.manifestId =
            data.manifestId ??
            `MANIFEST-${Date.now()}`;

        this.projectId =
            data.projectId ?? null;

        this.executionId =
            data.executionId ?? null;

        this.taskId =
            data.taskId ?? null;

        // ------------------------------------------------------
        // Producer
        // ------------------------------------------------------

        this.generatedBy =
            data.generatedBy ?? "AI Engineer";

        this.generatedAt =
            data.generatedAt ??
            new Date().toISOString();

        // ------------------------------------------------------
        // Build Status
        // ------------------------------------------------------

        this.status =
            data.status ?? "generated";

        this.version =
            data.version ?? "1.0.0";

        // ------------------------------------------------------
        // Generated Artifacts
        // ------------------------------------------------------

        this.artifacts =
            data.artifacts ?? [];

        // ------------------------------------------------------
        // Build Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

    addArtifact(artifact) {

        this.artifacts.push(artifact);

    }

    toJSON() {

        return {

            ...this

        };

    }

}