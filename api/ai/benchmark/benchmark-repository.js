// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.10
// Benchmark Repository
// Stores Benchmark Results
// ───────────────────────────────────────────────────────────────

export default class BenchmarkRepository {

    constructor() {

        this.results =
            new Map();

    }

    // ----------------------------------------------------------
    // Save
    // ----------------------------------------------------------

    save(result) {

        if (!result)
            throw new Error(
                "BenchmarkResult is required."
            );

        this.results.set(

            result.resultId,

            result

        );

        return result;

    }

    // ----------------------------------------------------------
    // Find
    // ----------------------------------------------------------

    find(resultId) {

        return this.results.get(

            resultId

        ) ?? null;

    }

    findByModel(modelId) {

        return this.getAll().filter(

            result =>

                result.modelId ===
                modelId

        );

    }

    findByProvider(provider) {

        return this.getAll().filter(

            result =>

                result.provider ===
                provider

        );

    }

    findByBenchmark(benchmarkId) {

        return this.getAll().filter(

            result =>

                result.benchmarkId ===
                benchmarkId

        );

    }

    // ----------------------------------------------------------
    // Statistics
    // ----------------------------------------------------------

    getAll() {

        return Array.from(

            this.results.values()

        );

    }

    count() {

        return this.results.size;

    }

    clear() {

        this.results.clear();

    }

    // ----------------------------------------------------------
    // Export / Import
    // ----------------------------------------------------------

    export() {

        return this.getAll();

    }

    import(results = []) {

        for (const result of results)

            this.save(result);

    }

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    summary() {

        const all =
            this.getAll();

        const successful =
            all.filter(

                result =>

                    result.success

            ).length;

        const failed =
            all.length -
            successful;

        return {

            total:
                all.length,

            successful,

            failed,

            successRate:

                all.length === 0

                    ? 0

                    : Number(

                        (

                            successful /

                            all.length

                        ) * 100

                    ).toFixed(2)

        };

    }

}