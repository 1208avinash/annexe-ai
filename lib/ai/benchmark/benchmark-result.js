// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.7
// Benchmark Result
// Persistent Benchmark Execution Result
// ───────────────────────────────────────────────────────────────

export default class BenchmarkResult {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.resultId =
            data.resultId ??
            `RESULT-${Date.now()}`;

        this.benchmarkId =
            data.benchmarkId ?? "";

        this.benchmarkName =
            data.benchmarkName ?? "";

        // ------------------------------------------------------
        // Provider
        // ------------------------------------------------------

        this.providerId =
            data.providerId ?? "";

        this.provider =
            data.provider ?? "";

        // ------------------------------------------------------
        // Model
        // ------------------------------------------------------

        this.modelId =
            data.modelId ?? "";

        this.modelSlug =
            data.modelSlug ?? "";

        this.modelVersion =
            data.modelVersion ?? "";

        // ------------------------------------------------------
        // Execution
        // ------------------------------------------------------

        this.startedAt =
            data.startedAt ??
            new Date().toISOString();

        this.completedAt =
            data.completedAt ?? null;

        this.durationMs =
            data.durationMs ?? 0;

        this.success =
            data.success ?? false;

        this.status =
            data.status ??
            (this.success
                ? "completed"
                : "failed");

        // ------------------------------------------------------
        // Token Usage
        // ------------------------------------------------------

        this.usage = {

            promptTokens:
                data.usage?.promptTokens ?? 0,

            completionTokens:
                data.usage?.completionTokens ?? 0,

            totalTokens:
                data.usage?.totalTokens ?? 0

        };

        // ------------------------------------------------------
        // Cost
        // ------------------------------------------------------

        this.cost = {

            estimated:
                data.cost?.estimated ?? 0,

            currency:
                data.cost?.currency ?? "USD"

        };

        // ------------------------------------------------------
        // Response
        // ------------------------------------------------------

        this.response =
            data.response ?? null;

        this.rawResponse =
            data.rawResponse ?? null;

        // ------------------------------------------------------
        // Evaluation Scores
        // ------------------------------------------------------

        this.scores = {

            syntax:
                data.scores?.syntax ?? null,

            correctness:
                data.scores?.correctness ?? null,

            quality:
                data.scores?.quality ?? null,

            maintainability:
                data.scores?.maintainability ?? null,

            performance:
                data.scores?.performance ?? null,

            security:
                data.scores?.security ?? null,

            overall:
                data.scores?.overall ?? null

        };

        // ------------------------------------------------------
        // Errors
        // ------------------------------------------------------

        this.errors =
            data.errors ?? [];

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

    }

}