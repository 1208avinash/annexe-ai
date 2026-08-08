// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.1
// AI Model Contract
// Universal AI Model Definition
// ───────────────────────────────────────────────────────────────

export default class AIModel {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.modelId =
            data.modelId ??
            `MODEL-${Date.now()}`;

        this.provider =
            data.provider ?? "";

        this.slug =
            data.slug ?? "";

        this.displayName =
            data.displayName ?? "";

        this.version =
            data.version ?? "";

        this.category =
            data.category ?? "chat";

        // ------------------------------------------------------
        // Pricing
        // ------------------------------------------------------

        this.pricing = {

            type:
                data.pricing?.type ?? "free",

            inputCost:
                data.pricing?.inputCost ?? 0,

            outputCost:
                data.pricing?.outputCost ?? 0,

            currency:
                data.pricing?.currency ?? "USD"

        };

        // ------------------------------------------------------
        // Capabilities
        // ------------------------------------------------------

        this.capabilities = {

            coding:
                data.capabilities?.coding ?? 0,

            reasoning:
                data.capabilities?.reasoning ?? 0,

            writing:
                data.capabilities?.writing ?? 0,

            mathematics:
                data.capabilities?.mathematics ?? 0,

            debugging:
                data.capabilities?.debugging ?? 0,

            planning:
                data.capabilities?.planning ?? 0

        };

        // ------------------------------------------------------
        // Limits
        // ------------------------------------------------------

        this.contextWindow =
            data.contextWindow ?? 0;

        this.maxOutputTokens =
            data.maxOutputTokens ?? 0;

        // ------------------------------------------------------
        // Features
        // ------------------------------------------------------

        this.features = {

            json:
                data.features?.json ?? false,

            streaming:
                data.features?.streaming ?? false,

            vision:
                data.features?.vision ?? false,

            tools:
                data.features?.tools ?? false,

            functionCalling:
                data.features?.functionCalling ?? false

        };

        // ------------------------------------------------------
        // Performance
        // ------------------------------------------------------

        this.performance = {

            quality:
                data.performance?.quality ?? 0,

            speed:
                data.performance?.speed ?? 0,

            reliability:
                data.performance?.reliability ?? 0,

            averageLatency:
                data.performance?.averageLatency ?? 0

        };

        // ------------------------------------------------------
        // Availability
        // ------------------------------------------------------

        this.status =
            data.status ?? "online";

        this.available =
            data.available ?? true;

        this.priority =
            data.priority ?? 100;

        // ------------------------------------------------------
        // Statistics
        // ------------------------------------------------------

        this.statistics = {

            requests:
                data.statistics?.requests ?? 0,

            successes:
                data.statistics?.successes ?? 0,

            failures:
                data.statistics?.failures ?? 0

        };

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

}