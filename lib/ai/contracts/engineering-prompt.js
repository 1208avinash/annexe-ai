// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.2
// Engineering Prompt Contract
// Canonical AI Generation Request
// ───────────────────────────────────────────────────────────────

export default class EngineeringPrompt {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.promptId =
            data.promptId ??
            `PROMPT-${Date.now()}`;

        this.version =
            data.version ?? "1.0.0";

        this.createdAt =
            data.createdAt ??
            new Date().toISOString();

        // ------------------------------------------------------
        // AI Metadata
        // ------------------------------------------------------

        this.provider =
            data.provider ?? null;

        this.model =
            data.model ?? null;

        // ------------------------------------------------------
        // Prompt Sections
        // ------------------------------------------------------

        this.systemInstructions =
            data.systemInstructions ?? "";

        this.engineeringContext =
            data.engineeringContext ?? {};

        this.task =
            data.task ?? {};

        this.outputRequirements =
            data.outputRequirements ?? {};

        this.responseFormat =
            data.responseFormat ?? {};

        // ------------------------------------------------------
        // Prompt Text
        // ------------------------------------------------------

        this.prompt =
            data.prompt ?? "";

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

    toJSON() {

        return {

            ...this

        };

    }

}