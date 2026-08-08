// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1
// Engineering Memory Platform
// Memory Provider Interface
// ───────────────────────────────────────────────────────────────

export default class MemoryProvider {

    create(record) {
        throw new Error("create() not implemented.");
    }

    update(id, changes) {
        throw new Error("update() not implemented.");
    }

    delete(id) {
        throw new Error("delete() not implemented.");
    }

    get(id) {
        throw new Error("get() not implemented.");
    }

    search(query) {
        throw new Error("search() not implemented.");
    }

    findByDomain(domain) {
        throw new Error("findByDomain() not implemented.");
    }

    findRelated(id) {
        throw new Error("findRelated() not implemented.");
    }

}