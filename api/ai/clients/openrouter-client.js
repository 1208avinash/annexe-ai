// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.3
// Generic AI HTTP Client
// Shared HTTP transport for AI providers
// ───────────────────────────────────────────────────────────────

export default class AIHttpClient {

    constructor(config = {}) {

        this.baseUrl =
            config.baseUrl;

        this.apiKey =
            config.apiKey;

        this.timeout =
            config.timeout ?? 120000;

    }

    async post(path, body, headers = {}) {

        if (!this.baseUrl)
            throw new Error("Base URL is required.");

        if (!this.apiKey)
            throw new Error("API key is required.");

        const response = await fetch(

            `${this.baseUrl}${path}`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${this.apiKey}`,

                    ...headers

                },

                body:
                    JSON.stringify(body),

                signal:
                    AbortSignal.timeout(
                        this.timeout
                    )

            }

        );

        if (!response.ok) {

            throw new Error(

                `HTTP ${response.status}: ${response.statusText}`

            );

        }

        return await response.json();

    }

}