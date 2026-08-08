// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.12
// AI Infrastructure Integration Test
// End-to-End Validation
// ───────────────────────────────────────────────────────────────

import Provider from "./lib/ai/provider.js";
import ProviderRegistry from "./lib/ai/provider-registry.js";

import AIModel from "./lib/ai/model-router/ai-model.js";
import ModelRegistry from "./lib/ai/model-router/model-registry.js";
import ModelRouter from "./lib/ai/model-router/model-router.js";

import Benchmark from "./lib/ai/benchmark/benchmark.js";
import BenchmarkSuite from "./lib/ai/benchmark/benchmark-suite.js";
import BenchmarkResult from "./lib/ai/benchmark/benchmark-result.js";
import BenchmarkRepository from "./lib/ai/benchmark/benchmark-repository.js";

import CapabilityEvaluator
    from "./lib/ai/model-router/capability-evaluator.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — AI INFRASTRUCTURE TEST");
console.log("═══════════════════════════════════════════════\n");

try {

    // ==========================================================
    // Provider Registry
    // ==========================================================

    const providerRegistry =
        new ProviderRegistry();

    const provider =
        new Provider({

            providerId:
                "openrouter",

            name:
                "OpenRouter"

        });

    providerRegistry.register(
        provider
    );

    console.log("✅ Provider Registry");

    // ==========================================================
    // Model Registry
    // ==========================================================

    const modelRegistry =
        new ModelRegistry();

    const model =
        new AIModel({

            provider:
                "OpenRouter",

            slug:
                "qwen/qwen3-coder",

            displayName:
                "Qwen 3 Coder",

            pricing: {

                type:
                    "free"

            },

            capabilities: {

                coding: 9,

                reasoning: 9,

                debugging: 9,

                planning: 8

            },

            performance: {

                quality: 9,

                speed: 8,

                reliability: 9

            },

            features: {

                json: true,

                streaming: true

            }

        });

    modelRegistry.register(
        model
    );

    console.log("✅ Model Registry");

    // ==========================================================
    // Router
    // ==========================================================

    const router =
        new ModelRouter(
            modelRegistry
        );

    const selected =
        router.select({

            taskType:
                "coding",

            freePreferred:
                true,

            requiresJson:
                true,

            minimumCoding:
                8

        });

    if (!selected)
        throw new Error(
            "Router failed."
        );

    console.log("✅ Model Router");

    // ==========================================================
    // Benchmark Suite
    // ==========================================================

    const benchmark =
        new Benchmark({

            name:
                "React Login",

            category:
                "frontend"

        });

    const suite =
        new BenchmarkSuite({

            name:
                "Frontend",

            category:
                "frontend",

            benchmarks: [

                benchmark

            ]

        });

    console.log("✅ Benchmark Suite");

    // ==========================================================
    // Repository
    // ==========================================================

    const repository =
        new BenchmarkRepository();

    const result =
        new BenchmarkResult({

            benchmarkId:
                benchmark.benchmarkId,

            benchmarkName:
                benchmark.name,

            provider:
                selected.provider,

            providerId:
                "openrouter",

            modelId:
                selected.modelId,

            modelSlug:
                selected.slug,

            success:
                true,

            scores: {

                syntax: 9,

                correctness: 9,

                quality: 9,

                maintainability: 9,

                performance: 8,

                security: 8

            },

            benchmark

        });

    repository.save(
        result
    );

    console.log("✅ Benchmark Repository");

    // ==========================================================
    // Capability Evaluation
    // ==========================================================

    const evaluator =
        new CapabilityEvaluator(
            modelRegistry
        );

    const scores =
        evaluator.evaluate(

            selected.modelId,

            repository.findByModel(
                selected.modelId
            )

        );

    console.log("✅ Capability Evaluator");

    // ==========================================================
    // Summary
    // ==========================================================

    console.log("\n══════════════════════════════════════");

    console.log(" AI INFRASTRUCTURE SUMMARY");

    console.log("══════════════════════════════════════");

    console.log(
        "Providers:",
        providerRegistry.count()
    );

    console.log(
        "Models:",
        modelRegistry.count()
    );

    console.log(
        "Benchmark Suites:",
        1
    );

    console.log(
        "Benchmark Results:",
        repository.count()
    );

    console.log(
        "Selected Model:",
        selected.displayName
    );

    console.log(
        "Overall Quality:",
        scores.overall.toFixed(2)
    );

    console.log(
        "\n🏆 AI INFRASTRUCTURE PASSED\n"
    );

}
catch (error) {

    console.error(
        "\n❌ AI INFRASTRUCTURE FAILED\n"
    );

    console.error(error);

    process.exit(1);

}