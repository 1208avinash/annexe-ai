// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.4.1
// OpenRouter Discovery Provider
// Discovers OpenRouter Models
// ───────────────────────────────────────────────────────────────

import AIModel
    from "../ai-model.js";

export default class OpenRouterDiscovery {

    constructor(config = {}) {

        this.name =
            "OpenRouter";

        this.apiKey =
            config.apiKey ??
            process.env.OPENROUTER_API_KEY;

        this.endpoint =
            "https://openrouter.ai/api/v1/models";

    }

    async discoverModels() {

        if (!this.apiKey)
            throw new Error(
                "OPENROUTER_API_KEY not configured."
            );

        const response =
            await fetch(

                this.endpoint,

                {

                    headers: {

                        Authorization:
                            `Bearer ${this.apiKey}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );

        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(

                `OpenRouter Discovery HTTP ${response.status}\n${error}`

            );

        }

        const json =
            await response.json();

        const models = [];

        for (const item of json.data ?? []) {

            models.push(

                new AIModel({

                    provider:
                        "OpenRouter",

                    slug:
                        item.id,

                    displayName:
                        item.name ?? item.id,

                    version:
                        item.id,

                    category:
                        "chat",

                    pricing: {

                        type:

                            item.id.includes(":free")
                                ? "free"
                                : "paid"

                    },

                    contextWindow:
                        item.context_length ?? 0,

                    maxOutputTokens:
                        item.top_provider?.max_completion_tokens ?? 0,

                    available:
                        true,

                    status:
                        "online",

                    metadata: {

                        architecture:
                            item.architecture,

                        modalities:
                            item.architecture?.input_modalities ?? [],

                        pricing:
                            item.pricing,

                        provider:
                            item.top_provider

                    }

                })

            );

        }

        return models;

    }

}