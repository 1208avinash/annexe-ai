// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.3.2
// Engineering Brain
// Knowledge Engine
// ───────────────────────────────────────────────────────────────

import { MemoryManager } from "../engineering-memory/index.js";

export default class KnowledgeEngine {

    constructor(memoryManager = new MemoryManager()) {

        this.memory = memoryManager;

    }

    retrieveKnowledge(query) {

        return {

            query,

            records: this.memory.searchMemory(query),

            total: this.memory.searchMemory(query).length

        };

    }

    findByDomain(domain) {

        return this.memory.findByDomain(domain);

    }

}