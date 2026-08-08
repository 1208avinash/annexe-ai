// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.11.1
// AI Provider Contract
// Universal Provider Definition
// ───────────────────────────────────────────────────────────────

export default class Provider {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.providerId =
            data.providerId ?? "";

        this.name =
            data.name ?? "";

        this.version =
            data.version ?? "1.0.0";

        // ------------------------------------------------------
        // Status
        // ------------------------------------------------------

        this.status =
            data.status ?? "online";

        this.available =
            data.available ?? true;

        this.priority =
            data.priority ?? 100;

        // ------------------------------------------------------
        // Health
        // ------------------------------------------------------

        this.health = {

            lastLatency:
                data.health?.lastLatency ?? 0,

            averageLatency:
                data.health?.averageLatency ?? 0,

            uptime:
                data.health?.uptime ?? 100,

            lastSuccess:
                data.health?.lastSuccess ?? null,

            lastFailure:
                data.health?.lastFailure ?? null

        };

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
        // Rate Limits
        // ------------------------------------------------------

        this.rateLimits = {

            requestsPerMinute:
                data.rateLimits?.requestsPerMinute ?? 0,

            requestsPerDay:
                data.rateLimits?.requestsPerDay ?? 0

        };

        // ------------------------------------------------------
        // Pricing
        // ------------------------------------------------------

        this.pricing = {

            type:
                data.pricing?.type ?? "free",

            currency:
                data.pricing?.currency ?? "USD"

        };

        // ------------------------------------------------------
        // Features
        // ------------------------------------------------------

        this.features = {

            chat:
                data.features?.chat ?? true,

            vision:
                data.features?.vision ?? false,

            tools:
                data.features?.tools ?? false,

            functionCalling:
                data.features?.functionCalling ?? false,

            streaming:
                data.features?.streaming ?? true

        };

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

    // ----------------------------------------------------------
    // Metrics
    // ----------------------------------------------------------

    getSuccessRate() {

        const {

            requests,

            successes

        } = this.statistics;

        if (requests === 0)
            return 0;

        return Number(

            (

                successes /

                requests

            ) * 100

        ).toFixed(2);

    }

    getFailureRate() {

        const {

            requests,

            failures

        } = this.statistics;

        if (requests === 0)
            return 0;

        return Number(

            (

                failures /

                requests

            ) * 100

        ).toFixed(2);

    }

}