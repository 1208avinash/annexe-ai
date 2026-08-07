// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.5
// Benchmark Contract
// Universal AI Benchmark Definition
// ───────────────────────────────────────────────────────────────

export default class Benchmark {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.benchmarkId =
            data.benchmarkId ??
            `BENCH-${Date.now()}`;

        this.name =
            data.name ?? "";

        this.category =
            data.category ?? "general";

        this.description =
            data.description ?? "";

        this.version =
            data.version ?? "1.0.0";

        // ------------------------------------------------------
        // Prompt
        // ------------------------------------------------------

        this.prompt =
            data.prompt ?? "";

        this.systemPrompt =
            data.systemPrompt ?? "";

        // ------------------------------------------------------
        // Expected Output
        // ------------------------------------------------------

        this.expected = {

            type:
                data.expected?.type ??
                "text",

            language:
                data.expected?.language ??
                "",

            schema:
                data.expected?.schema ??
                null

        };

        // ------------------------------------------------------
        // Evaluation
        // ------------------------------------------------------

        this.evaluation = {

            syntax:
                data.evaluation?.syntax ?? true,

            correctness:
                data.evaluation?.correctness ?? true,

            quality:
                data.evaluation?.quality ?? true,

            maintainability:
                data.evaluation?.maintainability ?? true,

            performance:
                data.evaluation?.performance ?? false,

            security:
                data.evaluation?.security ?? false

        };

        // ------------------------------------------------------
        // Weight
        // ------------------------------------------------------

        this.weight =
            data.weight ?? 1;

        this.timeoutSeconds =
            data.timeoutSeconds ?? 60;

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

}