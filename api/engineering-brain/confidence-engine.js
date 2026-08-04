// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.3.5
// Confidence Engine
// ───────────────────────────────────────────────────────────────

export default class ConfidenceEngine {

    evaluate(recommendation, evidencePackage) {

        const evidenceQuality =
            evidencePackage.averageConfidence ?? 0;

        const evidenceCoverage =
            Math.min(
                evidencePackage.total / 5,
                1
            );

        const recommendationCompleteness = [

            recommendation.architecture,
            recommendation.backend,
            recommendation.frontend,
            recommendation.database

        ].filter(Boolean).length / 4;

        const domainCoverage =
            recommendation.engineeringPatterns.length > 0
                ? 1
                : 0;

        const confidence = (

            evidenceQuality * 0.4 +

            evidenceCoverage * 0.2 +

            recommendationCompleteness * 0.2 +

            domainCoverage * 0.2

        );

        return {

            confidence:

                Number(confidence.toFixed(2)),

            breakdown: {

                evidenceQuality,

                evidenceCoverage,

                recommendationCompleteness,

                domainCoverage

            },

            explanation: [

                "Confidence calculated from engineering evidence.",

                "Recommendation completeness evaluated.",

                "Knowledge coverage considered."

            ],

            calculatedAt:

                new Date().toISOString()

        };

    }

}