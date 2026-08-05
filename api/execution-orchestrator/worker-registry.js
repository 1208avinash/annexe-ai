// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-7.4.1
// Worker Registry
// ───────────────────────────────────────────────────────────────

export default class WorkerRegistry {

    constructor() {

        this.workers = new Map();

    }

    register(name, worker) {

        this.workers.set(name, worker);

    }

    get(name) {

        return this.workers.get(name);

    }

    has(name) {

        return this.workers.has(name);

    }

    list() {

        return [...this.workers.keys()];

    }

}