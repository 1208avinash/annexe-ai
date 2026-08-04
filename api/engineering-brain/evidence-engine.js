// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.3.3
// Evidence Engine
// ───────────────────────────────────────────────────────────────

import EvidencePackage from "./contracts/evidence-package.js";

export default class EvidenceEngine {

    build(knowledgePackage) {

        const records = knowledgePackage.records ?? [];

        const evidence = records.map(record => ({

            id: record.id,

            title: record.title,

            domain: record.domain,

            confidence: record.confidence,

            reason: `Relevant to "${knowledgePackage.query}"`

        }));

        const averageConfidence =
            evidence.length === 0
                ? 0
                : evidence.reduce(
                    (sum, item) => sum + item.confidence,
                    0
                ) / evidence.length;

        return new EvidencePackage({

            evidence,

            total: evidence.length,

            averageConfidence

        });

    }

}