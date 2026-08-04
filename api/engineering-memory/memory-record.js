// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1
// Engineering Memory Platform
// MemoryRecord
// ───────────────────────────────────────────────────────────────

import {
    MemoryDomain,
    MemoryCategory,
    isValidMemoryDomain,
    isValidMemoryCategory
} from "./memory-types.js";

export default class MemoryRecord {

    constructor(data = {}) {

        this.id = data.id ?? null;

        this.domain = data.domain ?? MemoryDomain.KNOWLEDGE;

        this.category = data.category ?? MemoryCategory.GENERAL;

        this.title = data.title ?? "";

        this.description = data.description ?? "";

        this.evidence = data.evidence ?? [];

        this.references = data.references ?? [];

        this.confidence = data.confidence ?? 1.0;

        this.tags = data.tags ?? [];

        this.related = data.related ?? [];

        this.version = data.version ?? 1;

        this.createdAt = data.createdAt ?? new Date().toISOString();

        this.updatedAt = data.updatedAt ?? new Date().toISOString();

    }

    validate() {

        return (

            isValidMemoryDomain(this.domain) &&

            isValidMemoryCategory(this.category) &&

            this.title.length > 0

        );

    }

    toJSON() {

        return {

            id: this.id,

            domain: this.domain,

            category: this.category,

            title: this.title,

            description: this.description,

            evidence: this.evidence,

            references: this.references,

            confidence: this.confidence,

            tags: this.tags,

            related: this.related,

            version: this.version,

            createdAt: this.createdAt,

            updatedAt: this.updatedAt

        };

    }

}