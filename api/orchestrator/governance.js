// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.12
// Governance Framework
// ───────────────────────────────────────────────────────────────

export class GovernanceFramework {

    constructor() {

        this.plugins = [];

    }

    /**
     * Register a governance plugin.
     *
     * Plugin contract:
     *
     * {
     *     name: "engineering",
     *     review(task) => {
     *         allowed: true|false,
     *         reason: "...",
     *         metadata: {}
     *     }
     * }
     */

    register(plugin) {

        if (
            !plugin ||
            typeof plugin.review !== "function"
        ) {

            throw new Error(
                "Governance plugin must expose review()."
            );

        }

        this.plugins.push(plugin);

    }

    /**
     * Execute all governance plugins.
     */

    async review(task) {

        const reports = [];

        for (const plugin of this.plugins) {

            const result = await plugin.review(task);

            reports.push({

                plugin: plugin.name || "unknown",

                ...result

            });

            if (result.allowed === false) {

                return {

                    allowed: false,

                    reports,

                    blockedBy: plugin.name || "unknown"

                };

            }

        }

        return {

            allowed: true,

            reports

        };

    }

}

export default GovernanceFramework;