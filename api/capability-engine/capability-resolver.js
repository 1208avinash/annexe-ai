function normalizeDependency(dependency) {
    if (!dependency) {
        return null;
    }

    if (typeof dependency === "string") {
        return { name: dependency, version: null };
    }

    return {
        name: dependency.name ?? dependency.capability ?? null,
        version: dependency.version ?? null
    };
}

function matchesCompatibility(capability, stack = {}) {
    const compatibility = capability.compatibility ?? {};

    for (const [key, expected] of Object.entries(compatibility)) {
        if (!expected) {
            continue;
        }

        const actual = stack[key];
        const expectedValues = Array.isArray(expected) ? expected : [expected];

        if (actual && !expectedValues.some(value => String(value).toLowerCase() === String(actual).toLowerCase())) {
            return false;
        }
    }

    return true;
}

export default class CapabilityResolver {

    constructor({ registry } = {}) {
        this.registry = registry ?? null;
    }

    resolve(capabilityNames = [], stack = {}) {
        const ordered = [];
        const visited = new Set();
        const visiting = new Set();

        const visit = identifier => {
            const capability = this.registry?.get(identifier);
            if (!capability) {
                throw new Error(`Unknown capability: ${identifier}`);
            }

            if (!matchesCompatibility(capability, stack)) {
                throw new Error(`Capability ${capability.name} is not compatible with the requested stack.`);
            }

            if (visited.has(capability.name)) {
                return;
            }

            if (visiting.has(capability.name)) {
                throw new Error(`Capability dependency cycle detected: ${capability.name}`);
            }

            visiting.add(capability.name);

            for (const dependency of capability.dependencies ?? []) {
                const resolvedDependency = normalizeDependency(dependency);
                if (!resolvedDependency?.name) {
                    continue;
                }

                visit(resolvedDependency.name);
            }

            visiting.delete(capability.name);
            visited.add(capability.name);
            ordered.push(capability);
        };

        for (const capabilityName of capabilityNames) {
            visit(capabilityName);
        }

        return ordered;
    }

}
