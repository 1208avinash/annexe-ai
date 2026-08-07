// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.2
// Model Registry
// Universal AI Model Registry
// ───────────────────────────────────────────────────────────────

import AIModel
    from "./ai-model.js";

export default class ModelRegistry {

    constructor() {

        this.models =
            new Map();

    }

    // ----------------------------------------------------------
    // Registration
    // ----------------------------------------------------------

    register(model) {

        if (!(model instanceof AIModel))
            model = new AIModel(model);

        this.models.set(
            model.modelId,
            model
        );

        return model;

    }

    unregister(modelId) {

        return this.models.delete(
            modelId
        );

    }

    clear() {

        this.models.clear();

    }

    // ----------------------------------------------------------
    // Retrieval
    // ----------------------------------------------------------

    get(modelId) {

        return this.models.get(
            modelId
        ) ?? null;

    }

    getAll() {

        return Array.from(
            this.models.values()
        );

    }

    // ----------------------------------------------------------
    // Filters
    // ----------------------------------------------------------

    getAvailable() {

        return this.getAll().filter(

            model =>

                model.available &&
                model.status === "online"

        );

    }

    getByProvider(provider) {

        return this.getAll().filter(

            model =>

                model.provider === provider

        );

    }

    getFreeModels() {

        return this.getAll().filter(

            model =>

                model.pricing.type === "free"

        );

    }

    getPaidModels() {

        return this.getAll().filter(

            model =>

                model.pricing.type !== "free"

        );

    }

    getByCategory(category) {

        return this.getAll().filter(

            model =>

                model.category === category

        );

    }

    // ----------------------------------------------------------
    // Health Updates
    // ----------------------------------------------------------

    markUnavailable(modelId) {

        const model =
            this.get(modelId);

        if (!model)
            return;

        model.available = false;

        model.status =
            "offline";

    }

    markAvailable(modelId) {

        const model =
            this.get(modelId);

        if (!model)
            return;

        model.available = true;

        model.status =
            "online";

    }

    updatePerformance(modelId, performance = {}) {

        const model =
            this.get(modelId);

        if (!model)
            return;

        Object.assign(

            model.performance,

            performance

        );

    }

    recordSuccess(modelId, latency = 0) {

        const model =
            this.get(modelId);

        if (!model)
            return;

        model.statistics.requests++;

        model.statistics.successes++;

        model.performance.averageLatency =
            latency;

    }

    recordFailure(modelId, latency = 0) {

        const model =
            this.get(modelId);

        if (!model)
            return;

        model.statistics.requests++;

        model.statistics.failures++;

        model.performance.averageLatency =
            latency;

    }

    // ----------------------------------------------------------
    // Utility
    // ----------------------------------------------------------

    count() {

        return this.models.size;

    }

    has(modelId) {

        return this.models.has(
            modelId
        );

    }

}