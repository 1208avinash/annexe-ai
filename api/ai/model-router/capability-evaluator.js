// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 17.9
// Capability Evaluator
// Benchmark Results → Capability Scores
// ───────────────────────────────────────────────────────────────

export default class CapabilityEvaluator {

    constructor(registry) {

        if (!registry)
            throw new Error(
                "ModelRegistry is required."
            );

        this.registry =
            registry;

    }

    // ----------------------------------------------------------
    // Evaluate Benchmark Suite Results
    // ----------------------------------------------------------

    evaluate(modelId, results = []) {

        if (!Array.isArray(results))
            throw new Error(
                "Benchmark results are required."
            );

        if (results.length === 0)
            return null;

        const scores = {

            syntax: 0,
            correctness: 0,
            quality: 0,
            maintainability: 0,
            performance: 0,
            security: 0,
            overall: 0

        };

        let weight = 0;

        for (const result of results) {

            const w =
                result.benchmark?.weight ?? 1;

            weight += w;

            scores.syntax +=
                (result.scores?.syntax ?? 0) * w;

            scores.correctness +=
                (result.scores?.correctness ?? 0) * w;

            scores.quality +=
                (result.scores?.quality ?? 0) * w;

            scores.maintainability +=
                (result.scores?.maintainability ?? 0) * w;

            scores.performance +=
                (result.scores?.performance ?? 0) * w;

            scores.security +=
                (result.scores?.security ?? 0) * w;

        }

        if (weight === 0)
            weight = 1;

        scores.syntax /= weight;
        scores.correctness /= weight;
        scores.quality /= weight;
        scores.maintainability /= weight;
        scores.performance /= weight;
        scores.security /= weight;

        scores.overall = (

            scores.syntax +

            scores.correctness +

            scores.quality +

            scores.maintainability +

            scores.performance +

            scores.security

        ) / 6;

        // ------------------------------------------------------
        // Update Registry
        // ------------------------------------------------------

        const model =
            this.registry.get(modelId);

        if (model) {

            model.performance.quality =
                scores.overall;

            model.metadata.capabilities = {

                ...(model.metadata.capabilities ?? {}),

                evaluation:
                    scores,

                evaluatedAt:
                    new Date().toISOString()

            };

        }

        return scores;

    }

    // ----------------------------------------------------------
    // Compare Two Models
    // ----------------------------------------------------------

    compare(first, second) {

        if (!first || !second)
            return null;

        return {

            winner:

                first.performance.quality >=
                second.performance.quality

                    ? first.modelId

                    : second.modelId,

            difference:

                Math.abs(

                    first.performance.quality -

                    second.performance.quality

                )

        };

    }

}