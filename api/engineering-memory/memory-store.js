// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1
// Engineering Memory Platform
// Memory Store
// ───────────────────────────────────────────────────────────────

import MemoryProvider from "./memory-provider.js";

export default class MemoryStore extends MemoryProvider {

    constructor() {

        super();

        this.records = new Map();

    }

    create(record) {

        this.records.set(record.id, record);

        return record;

    }

    getById(id) {

        return this.records.get(id) ?? null;

    }

    update(id, changes) {

        const record = this.records.get(id);

        if (!record) {

            return null;

        }

        Object.assign(record, changes);

        record.updatedAt = new Date().toISOString();

        return record;

    }

    delete(id) {

        return this.records.delete(id);

    }

    search(query) {

        const q = query.toLowerCase();

        return [...this.records.values()].filter(r =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        );

    }

    findByDomain(domain) {

        return [...this.records.values()]
            .filter(r => r.domain === domain);

    }

    findRelated(id) {

        const record = this.records.get(id);

        if (!record) {

            return [];

        }

        return record.related
            .map(x => this.records.get(x))
            .filter(Boolean);

    }

}