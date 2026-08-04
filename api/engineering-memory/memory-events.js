// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1.8
// Engineering Memory Platform
// Memory Events
// ───────────────────────────────────────────────────────────────

export const MemoryEventType = Object.freeze({

    CREATED: "memory.created",

    UPDATED: "memory.updated",

    DELETED: "memory.deleted"

});

export default class MemoryEvents {

    constructor() {

        this.listeners = new Map();

    }

    on(event, handler) {

        if (!this.listeners.has(event)) {

            this.listeners.set(event, []);

        }

        this.listeners.get(event).push(handler);

    }

    emit(event, payload) {

        const handlers = this.listeners.get(event) ?? [];

        for (const handler of handlers) {

            handler(payload);

        }

    }

}