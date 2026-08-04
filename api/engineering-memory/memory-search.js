// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1.7
// Engineering Memory Platform
// Memory Search Service
// ───────────────────────────────────────────────────────────────

export default class MemorySearch {

    constructor(provider) {

        this.provider = provider;

    }

    search(query) {

        return this.provider.search(query);

    }

    findByDomain(domain) {

        return this.provider.findByDomain(domain);

    }

    findByTag(tag) {

        return [...this.provider.records.values()]
            .filter(record => record.tags.includes(tag));

    }

    searchAdvanced({
        query = "",
        domain = null,
        tag = null
    } = {}) {

        let results = [...this.provider.records.values()];

        if (query) {

            const q = query.toLowerCase();

            results = results.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q)
            );

        }

        if (domain) {

            results = results.filter(r => r.domain === domain);

        }

        if (tag) {

            results = results.filter(r =>
                r.tags.includes(tag)
            );

        }

        return results;

    }

}