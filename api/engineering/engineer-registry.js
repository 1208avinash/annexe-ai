// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 18.4
// Engineer Registry
// Central Registry For Autonomous AI Engineers
// ───────────────────────────────────────────────────────────────

export default class EngineerRegistry {

    constructor() {

        this.engineers =
            new Map();

    }

    // ----------------------------------------------------------
    // Registration
    // ----------------------------------------------------------

    register(engineer) {

        if (!engineer)
            throw new Error(
                "Engineer is required."
            );

        this.engineers.set(

            engineer.engineerId,

            engineer

        );

        return engineer;

    }

    unregister(engineerId) {

        return this.engineers.delete(
            engineerId
        );

    }

    // ----------------------------------------------------------
    // Lookup
    // ----------------------------------------------------------

    get(engineerId) {

        return this.engineers.get(
            engineerId
        ) ?? null;

    }

    getAll() {

        return Array.from(
            this.engineers.values()
        );

    }

    // ----------------------------------------------------------
    // Search
    // ----------------------------------------------------------

    findByRole(role) {

        return this.getAll().filter(

            engineer =>

                engineer.role === role

        );

    }

    findByDepartment(department) {

        return this.getAll().filter(

            engineer =>

                engineer.department ===
                department

        );

    }

    findByCapability(capability) {

        return this.getAll().filter(

            engineer =>

                engineer.capabilities.includes(
                    capability
                )

        );

    }

    // ----------------------------------------------------------
    // Availability
    // ----------------------------------------------------------

    getAvailable() {

        return this.getAll().filter(

            engineer =>

                engineer.status !==
                "busy"

        );

    }

    getBestEngineer(role) {

        const candidates =
            this.findByRole(role);

        if (candidates.length === 0)
            return null;

        candidates.sort(

            (a, b) =>

                b.getSuccessRate() -

                a.getSuccessRate()

        );

        return candidates[0];

    }

    // ----------------------------------------------------------
    // Statistics
    // ----------------------------------------------------------

    count() {

        return this.engineers.size;

    }

    clear() {

        this.engineers.clear();

    }

}