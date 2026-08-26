export default class CustomerMemory {
    constructor({ capacity = 100 } = {}) {
        this.capacity = capacity;
        this.entries = [];
    }

    remember(entry = {}) {
        const record = {
            ...entry,
            rememberedAt: new Date().toISOString()
        };

        this.entries.push(record);

        while (this.entries.length > this.capacity) {
            this.entries.shift();
        }

        return record;
    }

    latest() {
        return this.entries[this.entries.length - 1] ?? null;
    }

    list() {
        return [...this.entries];
    }
}
