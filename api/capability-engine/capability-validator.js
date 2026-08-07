const REQUIRED_FIELDS = [
    "name",
    "version",
    "description",
    "dependencies",
    "frontend",
    "backend",
    "routes",
    "permissions",
    "database",
    "events"
];

function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}

export default class CapabilityValidator {

    validate(capability = {}) {
        const errors = [];

        for (const field of REQUIRED_FIELDS) {
            if (capability[field] === undefined || capability[field] === null) {
                errors.push(`Missing capability field: ${field}`);
            }
        }

        if (capability.name && typeof capability.name !== "string") {
            errors.push("Capability name must be a string.");
        }

        if (capability.version && typeof capability.version !== "string") {
            errors.push("Capability version must be a string.");
        }

        if (capability.description && typeof capability.description !== "string") {
            errors.push("Capability description must be a string.");
        }

        if (!Array.isArray(capability.dependencies)) {
            errors.push("Capability dependencies must be an array.");
        }

        for (const field of ["routes", "permissions", "database", "events"]) {
            if (!Array.isArray(capability[field])) {
                errors.push(`Capability ${field} must be an array.`);
            }
        }

        if (capability.compatibility && typeof capability.compatibility !== "object") {
            errors.push("Capability compatibility must be an object when present.");
        }

        return {
            approved: errors.length === 0,
            errors,
            normalized: {
                ...capability,
                dependencies: ensureArray(capability.dependencies),
                routes: ensureArray(capability.routes),
                permissions: ensureArray(capability.permissions),
                database: ensureArray(capability.database),
                events: ensureArray(capability.events)
            }
        };
    }

}
