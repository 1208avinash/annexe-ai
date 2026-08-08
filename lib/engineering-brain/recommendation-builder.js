// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.3.4
// Recommendation Builder
// ───────────────────────────────────────────────────────────────

import EngineeringRecommendation
from "./contracts/engineering-recommendation.js";

export default class RecommendationBuilder {

    build(requirement, knowledgePackage, evidencePackage) {

        const recommendation = new EngineeringRecommendation({

            recommendationId:
                `REC-${Date.now()}`,

            projectId:
                requirement.projectId ?? null,

            executiveSummary:
                requirement.summary ?? requirement.query ?? "",

            architecture:
                "Multi-tenant SaaS",

            backend:
                "Node.js",

            frontend:
                "React",

            database:
                "PostgreSQL",

            infrastructure: [

                "Docker",

                "Redis"

            ],

            reusableComponents:

                knowledgePackage.records
                    .map(r => r.title),

            engineeringPatterns:

                knowledgePackage.records
                    .map(r => r.domain),

            evidence:

                evidencePackage.evidence,

            reasoning:

                "Recommendation generated using Engineering Memory and Evidence Engine.",

            confidence:

                evidencePackage.averageConfidence

        });

        return recommendation;

    }

}