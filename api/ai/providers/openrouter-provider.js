// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.3
// OpenRouter Provider
// First AI Provider Implementation
// ───────────────────────────────────────────────────────────────

import AIProvider
    from "./provider.js";

import GenerationResult
    from "../contracts/generation-result.js";

export default class OpenRouterProvider extends AIProvider {

    constructor(config = {}) {

        super({

            providerName: "OpenRouter",

            version: "1.0.0",

            models: config.models ?? []

        });

        this.client =
            config.client;

        this.model =
            config.model ??
            "openai/gpt-5.5";

    }

    async generate(engineeringPrompt) {

        if (!engineeringPrompt)
            throw new Error(
                "EngineeringPrompt is required."
            );

        if (!this.client)
            throw new Error(
                "OpenRouter client is required."
            );

        const started =
            Date.now();

        try {

            const response =
                await this.client.generate({

                    model:
                        this.model,

                    prompt:
                        engineeringPrompt.prompt

                });

            return new GenerationResult({

                provider:
                    "OpenRouter",

                model:
                    this.model,

                success: true,

                status: "completed",

                generatedFiles:
                    response.generatedFiles ?? [],

                usage:
                    response.usage ?? {},

                latencyMs:
                    Date.now() - started,

                rawResponse:
                    response

            });

        }
        catch (error) {

            return new GenerationResult({

                provider:
                    "OpenRouter",

                model:
                    this.model,

                success: false,

                status: "failed",

                message:
                    error.message,

                latencyMs:
                    Date.now() - started

            });

        }

    }

}