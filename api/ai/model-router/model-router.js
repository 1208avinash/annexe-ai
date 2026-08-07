// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.3
// Model Router
// Intelligent AI Model Selection
// ───────────────────────────────────────────────────────────────

export default class ModelRouter {

    constructor(registry) {

        if (!registry)
            throw new Error(
                "ModelRegistry is required."
            );

        this.registry =
            registry;

    }

    // ----------------------------------------------------------
    // Select Best Model
    // ----------------------------------------------------------

    select(options = {}) {

        const {

            taskType = "general",

            preferredProvider = null,

            freePreferred = true,

            paidAllowed = true,

            requiresJson = false,

            requiresVision = false,

            requiresTools = false,

            minimumCoding = 0,

            minimumReasoning = 0

        } = options;

        let models =
            this.registry.getAvailable();

        // ------------------------------------------------------
        // Provider Preference
        // ------------------------------------------------------

        if (preferredProvider) {

            const providerModels =
                models.filter(

                    model =>

                        model.provider ===
                        preferredProvider

                );

            if (providerModels.length)
                models =
                    providerModels;

        }

        // ------------------------------------------------------
        // Feature Filters
        // ------------------------------------------------------

        models = models.filter(model => {

            if (
                requiresJson &&
                !model.features.json
            )
                return false;

            if (
                requiresVision &&
                !model.features.vision
            )
                return false;

            if (
                requiresTools &&
                !model.features.tools
            )
                return false;

            if (
                model.capabilities.coding <
                minimumCoding
            )
                return false;

            if (
                model.capabilities.reasoning <
                minimumReasoning
            )
                return false;

            return true;

        });

        // ------------------------------------------------------
        // Free Preference
        // ------------------------------------------------------

        if (freePreferred) {

            const freeModels =
                models.filter(

                    model =>

                        model.pricing.type ===
                        "free"

                );

            if (freeModels.length)
                models =
                    freeModels;

            else if (!paidAllowed)

                return null;

        }

        // ------------------------------------------------------
        // Ranking
        // ------------------------------------------------------

        models.sort((a, b) =>

            this.score(

                b,

                taskType

            ) -

            this.score(

                a,

                taskType

            )

        );

        return models[0] ?? null;

    }

    // ----------------------------------------------------------
    // Model Scoring
    // ----------------------------------------------------------

    score(model, taskType) {

        let score = 0;

        score +=
            model.performance.quality * 5;

        score +=
            model.performance.reliability * 4;

        score +=
            model.performance.speed * 3;

        score +=
            model.capabilities.reasoning * 3;

        switch (taskType) {

            case "frontend":

            case "backend":

            case "coding":

                score +=
                    model.capabilities.coding * 10;

                score +=
                    model.capabilities.debugging * 5;

                break;

            case "architecture":

                score +=
                    model.capabilities.reasoning * 10;

                score +=
                    model.capabilities.planning * 8;

                break;

            case "documentation":

                score +=
                    model.capabilities.writing * 8;

                break;

            default:

                score +=
                    model.capabilities.reasoning * 4;

        }

        if (
            model.pricing.type === "free"
        )
            score += 10;

        score +=
            model.priority;

        return score;

    }

    // ----------------------------------------------------------
    // Automatic Failover
    // ----------------------------------------------------------

    failover(modelId) {

        this.registry.markUnavailable(
            modelId
        );

    }

}