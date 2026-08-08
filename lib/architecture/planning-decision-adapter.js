// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 16.1
// Planning Decision Adapter
// Engineering Specification → Planning Decision
// ───────────────────────────────────────────────────────────────




export default class PlanningDecisionAdapter {

    adapt(specification) {

        if (!specification)
            throw new Error(
                "EngineeringSpecification is required."
            );

        return {

            // --------------------------------------------------
            // Identity
            // --------------------------------------------------

            decisionId:
                specification.specificationId,

            projectId:
                specification.project.id,

                // --------------------------------------------------
    // V5 Planning Compatibility
    // --------------------------------------------------

    approved:
        true,



            // --------------------------------------------------
            // Project
            // --------------------------------------------------

            project: {

                id:
                    specification.project.id,

                name:
                    specification.project.name,

                description:
                    specification.project.description

            },

            // --------------------------------------------------
            // Technology
            // --------------------------------------------------

            technology: {

                frontend:
                    specification.frontend.framework,

                backend:
                    specification.backend.framework,

                database:
                    specification.database.engine,

                deployment:
                    specification.deployment.platform

            },

            // --------------------------------------------------
            // Architecture
            // --------------------------------------------------

            architecture:
                specification.architecture,

            // --------------------------------------------------
            // Business
            // --------------------------------------------------

            businessGoals:
                specification.businessGoals,

            // --------------------------------------------------
            // Requirements
            // --------------------------------------------------

            requirements:
                specification.functionalRequirements,

            // --------------------------------------------------
            // Frontend
            // --------------------------------------------------

            frontend:
                specification.frontend,

            // --------------------------------------------------
            // Backend
            // --------------------------------------------------

            backend:
                specification.backend,

            // --------------------------------------------------
            // Database
            // --------------------------------------------------

            database:
                specification.database,

            // --------------------------------------------------
            // Deployment
            // --------------------------------------------------

            deployment:
                specification.deployment,

            // --------------------------------------------------
            // Compatibility
            // --------------------------------------------------

            solution: {

                frontend:
                    specification.frontend.modules ?? [],

                backend:
                    specification.backend.services ?? [],

                database:
                    specification.database.entities ?? []

            }

        };

    }

}