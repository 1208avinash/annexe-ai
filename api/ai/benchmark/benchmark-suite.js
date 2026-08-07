// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.8
// Benchmark Suite
// Collection of Related Benchmarks
// ───────────────────────────────────────────────────────────────

import Benchmark
    from "./benchmark.js";

export default class BenchmarkSuite {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.suiteId =
            data.suiteId ??
            `SUITE-${Date.now()}`;

        this.name =
            data.name ?? "";

        this.category =
            data.category ?? "general";

        this.description =
            data.description ?? "";

        this.version =
            data.version ?? "1.0.0";

        // ------------------------------------------------------
        // Benchmarks
        // ------------------------------------------------------

        this.benchmarks = [];

        for (const benchmark of data.benchmarks ?? []) {

            this.addBenchmark(
                benchmark
            );

        }

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.weight =
            data.weight ?? 1;

        this.enabled =
            data.enabled ?? true;

        this.metadata =
            data.metadata ?? {};

    }

    // ----------------------------------------------------------
    // Benchmark Management
    // ----------------------------------------------------------

    addBenchmark(benchmark) {

        if (!(benchmark instanceof Benchmark))
            benchmark =
                new Benchmark(
                    benchmark
                );

        this.benchmarks.push(
            benchmark
        );

        return benchmark;

    }

    removeBenchmark(benchmarkId) {

        this.benchmarks =
            this.benchmarks.filter(

                benchmark =>

                    benchmark.benchmarkId !==
                    benchmarkId

            );

    }

    getBenchmark(benchmarkId) {

        return this.benchmarks.find(

            benchmark =>

                benchmark.benchmarkId ===
                benchmarkId

        ) ?? null;

    }

    getBenchmarks() {

        return [

            ...this.benchmarks

        ];

    }

    // ----------------------------------------------------------
    // Statistics
    // ----------------------------------------------------------

    count() {

        return this.benchmarks.length;

    }

    isEmpty() {

        return this.count() === 0;

    }

}