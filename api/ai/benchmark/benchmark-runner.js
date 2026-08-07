// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.6
// Benchmark Runner
// Executes Benchmarks Using AI Infrastructure
// ───────────────────────────────────────────────────────────────

export default class BenchmarkRunner {

    constructor({

        modelRouter,

        generationEngine,

        promptBuilder

    }) {

        if (!modelRouter)
            throw new Error(
                "ModelRouter is required."
            );

        if (!generationEngine)
            throw new Error(
                "GenerationEngine is required."
            );

        this.modelRouter =
            modelRouter;

        this.generationEngine =
            generationEngine;

        this.promptBuilder =
            promptBuilder;

    }

    async run(benchmark) {

        if (!benchmark)
            throw new Error(
                "Benchmark is required."
            );

        const started =
            Date.now();

        // ------------------------------------------------------
        // Select Model
        // ------------------------------------------------------

        const model =
            this.modelRouter.select({

                taskType:
                    benchmark.category,

                freePreferred:
                    true,

                paidAllowed:
                    true,

                requiresJson:
                    benchmark.expected.type === "json"

            });

        if (!model)
            throw new Error(
                "No compatible AI model found."
            );

        // ------------------------------------------------------
        // Build Engineering Prompt
        // ------------------------------------------------------

        const engineeringPrompt =

            this.promptBuilder

                ? this.promptBuilder.build({

                    systemInstructions:
                        benchmark.systemPrompt,

                    prompt:
                        benchmark.prompt

                })

                : {

                    systemInstructions:
                        benchmark.systemPrompt,

                    prompt:
                        benchmark.prompt

                };

        // ------------------------------------------------------
        // Execute Generation
        // ------------------------------------------------------

        const generation =
            await this.generationEngine.generate({

                provider:
                    model.provider.toLowerCase(),

                engineeringPrompt

            });

        return {

            benchmarkId:
                benchmark.benchmarkId,

            modelId:
                model.modelId,

            provider:
                model.provider,

            model:
                model.slug,

            startedAt:
                new Date(started).toISOString(),

            completedAt:
                new Date().toISOString(),

            durationMs:
                Date.now() - started,

            success:
                generation.success,

            response:
                generation,

            benchmark,

            metadata: {

                category:
                    benchmark.category,

                expected:
                    benchmark.expected,

                evaluation:
                    benchmark.evaluation

            }

        };

    }

}