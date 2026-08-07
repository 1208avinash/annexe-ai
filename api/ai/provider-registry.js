// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.11
// Provider Registry
// Universal AI Provider Registry
// ───────────────────────────────────────────────────────────────

export default class ProviderRegistry {

    constructor() {

        this.providers =
            new Map();

    }

    // ----------------------------------------------------------
    // Registration
    // ----------------------------------------------------------

    register(provider) {

        if (!provider)
            throw new Error(
                "Provider is required."
            );

        if (!provider.providerId)
            throw new Error(
                "Provider ID is required."
            );

        this.providers.set(

            provider.providerId,

            provider

        );

        return provider;

    }

    unregister(providerId) {

        return this.providers.delete(
            providerId
        );

    }

    // ----------------------------------------------------------
    // Retrieval
    // ----------------------------------------------------------

    get(providerId) {

        return this.providers.get(
            providerId
        ) ?? null;

    }

    getAll() {

        return Array.from(
            this.providers.values()
        );

    }

    // ----------------------------------------------------------
    // Filters
    // ----------------------------------------------------------

    getHealthy() {

        return this.getAll().filter(

            provider =>

                provider.available &&
                provider.status === "online"

        );

    }

    getAvailable() {

        return this.getHealthy();

    }

    // ----------------------------------------------------------
    // Health
    // ----------------------------------------------------------

    markOnline(providerId) {

        const provider =
            this.get(providerId);

        if (!provider)
            return;

        provider.available = true;
        provider.status = "online";

    }

    markOffline(providerId) {

        const provider =
            this.get(providerId);

        if (!provider)
            return;

        provider.available = false;
        provider.status = "offline";

    }

    updateHealth(providerId, health = {}) {

        const provider =
            this.get(providerId);

        if (!provider)
            return;

        provider.health = {

            ...provider.health,

            ...health

        };

    }

    recordSuccess(providerId, latency = 0) {

        const provider =
            this.get(providerId);

        if (!provider)
            return;

        provider.statistics.requests++;
        provider.statistics.successes++;

        provider.health.lastLatency =
            latency;

        provider.health.lastSuccess =
            new Date().toISOString();

    }

    recordFailure(providerId, latency = 0) {

        const provider =
            this.get(providerId);

        if (!provider)
            return;

        provider.statistics.requests++;
        provider.statistics.failures++;

        provider.health.lastLatency =
            latency;

        provider.health.lastFailure =
            new Date().toISOString();

    }

    // ----------------------------------------------------------
    // Statistics
    // ----------------------------------------------------------

    count() {

        return this.providers.size;

    }

    clear() {

        this.providers.clear();

    }

}