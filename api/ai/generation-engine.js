// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.3
// AI Generation Engine
// EngineeringPrompt → GenerationResult
// ───────────────────────────────────────────────────────────────

export default class GenerationEngine {

    constructor(options = {}) {

        this.providers =
            options.providers ?? {};

        this.defaultProvider =
            options.defaultProvider ??
            "openrouter";

    }

    registerProvider(name, provider) {

        this.providers[name] = provider;

    }

    async generate({

        engineeringPrompt,

        provider

    }) {

        if (!engineeringPrompt)
            throw new Error(
                "EngineeringPrompt is required."
            );

        const providerName =
            provider ??
            this.defaultProvider;

        const aiProvider =
            this.providers[providerName];

        if (!aiProvider)
            throw new Error(
                `Provider '${providerName}' not registered.`
            );

        return await aiProvider.generate(
            engineeringPrompt
        );

    }

}