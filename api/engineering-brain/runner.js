// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.4.1
// Engineering Brain Runner
// Public Execution API
// ───────────────────────────────────────────────────────────────

import KnowledgeEngine from "./knowledge-engine.js";
import EvidenceEngine from "./evidence-engine.js";
import RecommendationBuilder from "./recommendation-builder.js";
import ConfidenceEngine from "./confidence-engine.js";

export default class EngineeringBrain {

    constructor() {

        this.knowledge = new KnowledgeEngine();
        this.evidence = new EvidenceEngine();
        this.recommendations = new RecommendationBuilder();
        this.confidence = new ConfidenceEngine();

    }

    run(requirementReport = {}) {

        const requirement =
            requirementReport?.report ?? {};

        const query =
            requirement.businessGoal ?? "";

        const knowledgePackage =
            this.knowledge.retrieveKnowledge(query);

        const evidencePackage =
            this.evidence.build(knowledgePackage);

        const recommendation =
            this.recommendations.build(
                requirement,
                knowledgePackage,
                evidencePackage
            );

        const confidence =
            this.confidence.evaluate(
                recommendation,
                evidencePackage
            );

        recommendation.confidence =
            confidence.confidence;

        return {

            success: true,

            requirement,

            knowledge: knowledgePackage,

            evidence: evidencePackage,

            recommendation,

            confidence

        };

    }

}