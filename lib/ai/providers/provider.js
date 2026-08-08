// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.3
// AI Provider Interface
// Base contract for all AI providers
// ───────────────────────────────────────────────────────────────

export default class AIProvider {

    constructor(config = {}) {

        this.providerId =
            config.providerId ??
            `PROVIDER-${Date.now()}`;

        this.providerName =
            config.providerName ??
            "Generic Provider";

        this.version =
            config.version ?? "1.0.0";

        this.models =
            config.models ?? [];

    }

    /**
     * Generate source code from an Engineering Prompt.
     *
     * Must return a GenerationResult.
     */
    async generate(engineeringPrompt) {

        throw new Error(

            `${this.providerName} must implement generate(engineeringPrompt).`

        );

    }

}