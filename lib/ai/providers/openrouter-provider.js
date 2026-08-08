// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 14.1
// OpenRouter Provider
// Production AI Provider
// ───────────────────────────────────────────────────────────────

import AIProvider
    from "./provider.js";

import GenerationResult
    from "../contracts/generation-result.js";

import JsonResponseParser
    from "../json-response-parser.js";

export default class OpenRouterProvider extends AIProvider {

    constructor(config = {}) {

        super({

            providerName: "OpenRouter",

            version: "1.0.0",

            models: config.models ?? []

        });

        this.apiKey =
            config.apiKey ??
            process.env.OPENROUTER_API_KEY;

        this.model =
            config.model ??
            process.env.OPENROUTER_MODEL ??
            "openai/gpt-5.5";

        this.baseUrl =
            "https://openrouter.ai/api/v1/chat/completions";

        this.parser =
            new JsonResponseParser();

    }

    async generate(engineeringPrompt) {

        if (!engineeringPrompt)
            throw new Error(
                "EngineeringPrompt is required."
            );

        if (!this.apiKey)
            throw new Error(
                "OPENROUTER_API_KEY not configured."
            );

        const started =
            Date.now();

        try {

            const response =
                await fetch(

                    this.baseUrl,

                    {

                        method: "POST",

                        headers: {

                            Authorization:
                                `Bearer ${this.apiKey}`,

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            model:
                                this.model,

                            messages: [

                                {

                                    role: "system",

                                    content:
                                        engineeringPrompt.systemInstructions

                                },

                                {

                                    role: "user",

                                    content:
                                        engineeringPrompt.prompt

                                }

                            ]

                        })

                    }

                );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(

                    `OpenRouter HTTP ${response.status}\n${errorText}`

                );

            }

            const json =
                await response.json();

            const content =
                json.choices?.[0]?.message?.content ?? "";

            let generatedFiles;

            try {

                generatedFiles =
                    this.parser.parse(content);

            }
            catch (error) {

                console.warn(

                    "AI JSON parsing failed:",

                    error.message

                );

                generatedFiles = [

                    {

                        path:
                            "generated-output.txt",

                        type:
                            "documentation",

                        language:
                            "text",

                        content

                    }

                ];

            }

            return new GenerationResult({

                provider:
                    "OpenRouter",

                model:
                    this.model,

                success: true,

                status:
                    "completed",

                generatedFiles,

                usage: {

                    promptTokens:
                        json.usage?.prompt_tokens ?? 0,

                    completionTokens:
                        json.usage?.completion_tokens ?? 0,

                    totalTokens:
                        json.usage?.total_tokens ?? 0

                },

                latencyMs:
                    Date.now() - started,

                rawResponse:
                    json

            });

        }
        catch (error) {

            return new GenerationResult({

                provider:
                    "OpenRouter",

                model:
                    this.model,

                success: false,

                status:
                    "failed",

                message:
                    error.message,

                latencyMs:
                    Date.now() - started

            });

        }

    }

}