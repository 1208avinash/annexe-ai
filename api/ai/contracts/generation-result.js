// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.3
// Generation Result Contract
// Canonical AI Generation Response
// ───────────────────────────────────────────────────────────────

export default class GenerationResult {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.requestId =
            data.requestId ??
            `GEN-${Date.now()}`;

        this.generatedAt =
            data.generatedAt ??
            new Date().toISOString();

        // ------------------------------------------------------
        // Provider Information
        // ------------------------------------------------------

        this.provider =
            data.provider ?? null;

        this.model =
            data.model ?? null;

        // ------------------------------------------------------
        // Status
        // ------------------------------------------------------

        this.success =
            data.success ?? false;

        this.status =
            data.status ??
            (this.success ? "completed" : "failed");

        this.message =
            data.message ?? "";

        // ------------------------------------------------------
        // Generated Output
        // ------------------------------------------------------

        this.generatedFiles =
            data.generatedFiles ?? [];

        // ------------------------------------------------------
        // Usage Metrics
        // ------------------------------------------------------

        this.usage = {

            promptTokens:
                data.usage?.promptTokens ?? 0,

            completionTokens:
                data.usage?.completionTokens ?? 0,

            totalTokens:
                data.usage?.totalTokens ?? 0

        };

        this.latencyMs =
            data.latencyMs ?? 0;

        // ------------------------------------------------------
        // Raw Provider Response
        // ------------------------------------------------------

        this.rawResponse =
            data.rawResponse ?? null;

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

    addGeneratedFile(file) {

        this.generatedFiles.push(file);

    }

    toJSON() {

        return {

            ...this

        };

    }

}