import CapabilityValidator from "./capability-validator.js";

export default class CapabilityRegistry {

    constructor(capabilities = []) {
        this.validator = new CapabilityValidator();
        this.capabilities = new Map();
        this.aliases = new Map();

        for (const capability of capabilities) {
            this.register(capability);
        }
    }

    register(capability) {
        const validation = this.validator.validate(capability);

        if (!validation.approved) {
            throw new Error(validation.errors.join(" "));
        }

        const normalized = validation.normalized;
        this.capabilities.set(normalized.name, normalized);

        for (const alias of normalized.aliases ?? []) {
            if (alias) {
                this.aliases.set(String(alias).toLowerCase(), normalized.name);
            }
        }

        return normalized;
    }

    resolveName(identifier) {
        if (!identifier) {
            return null;
        }

        const normalized = String(identifier).toLowerCase();
        return this.capabilities.has(identifier)
            ? identifier
            : this.aliases.get(normalized) ?? null;
    }

    get(identifier) {
        const name = this.resolveName(identifier);
        if (!name) {
            return null;
        }

        return this.capabilities.get(name) ?? null;
    }

    has(identifier) {
        return Boolean(this.get(identifier));
    }

    list() {
        return Array.from(this.capabilities.values());
    }

    count() {
        return this.capabilities.size;
    }

}
