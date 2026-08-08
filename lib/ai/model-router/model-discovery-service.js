// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.4
// Model Discovery Service
// Universal AI Model Discovery Manager
// ───────────────────────────────────────────────────────────────

export default class ModelDiscoveryService {

    constructor(registry) {

        if (!registry)
            throw new Error(
                "ModelRegistry is required."
            );

        this.registry =
            registry;

        this.providers = [];

        this.lastRefresh = null;

    }

    // ----------------------------------------------------------
    // Provider Registration
    // ----------------------------------------------------------

    registerProvider(provider) {

        this.providers.push(
            provider
        );

    }

    // ----------------------------------------------------------
    // Refresh All Providers
    // ----------------------------------------------------------

    async refresh() {

        this.registry.clear();

        for (const provider of this.providers) {

            try {

                const models =
                    await provider.discoverModels();

                for (const model of models)

                    this.registry.register(
                        model
                    );

            }
            catch (error) {

                console.warn(

                    `Model discovery failed for ${provider.name}:`,

                    error.message

                );

            }

        }

        this.lastRefresh =
            new Date().toISOString();

        return {

            refreshedAt:
                this.lastRefresh,

            providers:
                this.providers.length,

            models:
                this.registry.count()

        };

    }

    // ----------------------------------------------------------
    // Metadata
    // ----------------------------------------------------------

    getStatus() {

        return {

            providers:
                this.providers.length,

            models:
                this.registry.count(),

            lastRefresh:
                this.lastRefresh

        };

    }

}