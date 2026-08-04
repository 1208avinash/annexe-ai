// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.3.3
// Evidence Package Contract
// ───────────────────────────────────────────────────────────────

export default class EvidencePackage {

    constructor(data = {}) {

        this.evidence = data.evidence ?? [];

        this.total = data.total ?? 0;

        this.averageConfidence = data.averageConfidence ?? 0;

        this.generatedAt = data.generatedAt ?? new Date().toISOString();

    }

    toJSON() {

        return { ...this };

    }

}