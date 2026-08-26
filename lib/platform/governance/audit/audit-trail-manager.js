import crypto from "crypto";

export default class AuditTrailManager {
    constructor() {
        this.entries = [];
    }

    record(entry = {}) {
        const record = {
            id: entry.id ?? `AUD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
            timestamp: entry.timestamp ?? new Date().toISOString(),
            actor: entry.actor ?? "system",
            action: entry.action ?? "governance.check",
            resource: entry.resource ?? "governance",
            result: entry.result ?? "approved"
        };

        this.entries.push(record);
        return record;
    }

    list() {
        return [...this.entries];
    }
}
