// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1.6
// Engineering Memory Platform
// Memory Manager
// ───────────────────────────────────────────────────────────────

import MemoryStore from "./memory-store.js";
import MemoryRecord from "./memory-record.js";
import { validateMemoryRecord } from "./memory-validator.js";

export default class MemoryManager {

    constructor(provider = new MemoryStore()) {

        this.provider = provider;

    }

    createMemory(data) {

        const record = data instanceof MemoryRecord
            ? data
            : new MemoryRecord(data);

        if (!record.id) {

            record.id = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        }

        const validation = validateMemoryRecord(record);

        if (!validation.valid) {

            throw new Error(validation.errors.join("\n"));

        }

        return this.provider.create(record);

    }

    getMemory(id) {

        return this.provider.getById(id);

    }

    updateMemory(id, changes) {

        return this.provider.update(id, changes);

    }

    deleteMemory(id) {

        return this.provider.delete(id);

    }

    searchMemory(query) {

        return this.provider.search(query);

    }

    findByDomain(domain) {

        return this.provider.findByDomain(domain);

    }

}