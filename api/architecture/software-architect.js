// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 15.2
// Software Architect
// Business Analysis → Engineering Specification
// ───────────────────────────────────────────────────────────────

import EngineeringSpecification
    from "./engineering-specification.js";

export default class SoftwareArchitect {

    createSpecification({

        project,

        businessAnalysis,

        engineeringPlan

    }) {

        if (!project)
            throw new Error(
                "Project is required."
            );

        if (!businessAnalysis)
            throw new Error(
                "Business analysis is required."
            );

        if (!engineeringPlan)
            throw new Error(
                "Engineering plan is required."
            );

        return new EngineeringSpecification({

            project: {

                id:
                    project.projectId,

                name:
                    project.name,

                description:
                    project.description,

                domain:
                    businessAnalysis.industry,

                type:
                    engineeringPlan.projectType

            },

            businessGoals:
                businessAnalysis.businessGoals ?? [],

            functionalRequirements:
                engineeringPlan.functionalRequirements ?? [],

            nonFunctionalRequirements:
                engineeringPlan.nonFunctionalRequirements ?? [],

            architecture: {

                frontend:
                    engineeringPlan.frontend,

                backend:
                    engineeringPlan.backend,

                database:
                    engineeringPlan.database,

                deployment:
                    engineeringPlan.deployment

            },

            frontend: {

                framework:
                    engineeringPlan.frontend,

                modules:
                    engineeringPlan.frontendModules ?? []

            },

            backend: {

                framework:
                    engineeringPlan.backend,

                services:
                    engineeringPlan.backendServices ?? []

            },

            database: {

                engine:
                    engineeringPlan.database,

                entities:
                    engineeringPlan.entities ?? []

            },

            api: {

                style:
                    engineeringPlan.apiStyle ?? "REST",

                endpoints:
                    engineeringPlan.endpoints ?? []

            },

            integrations:
                engineeringPlan.integrations ?? [],

            security: {

                authentication:
                    engineeringPlan.authentication ?? "JWT",

                authorization:
                    engineeringPlan.authorization ?? "RBAC",

                requirements:
                    engineeringPlan.securityRequirements ?? []

            },

            testing: {

                unit:
                    true,

                integration:
                    true,

                e2e:
                    engineeringPlan.e2e ?? false

            },

            deployment: {

                platform:
                    engineeringPlan.deployment,

                strategy:
                    engineeringPlan.deploymentStrategy ?? "Docker"

            },

            constraints:
                engineeringPlan.constraints ?? [],

            risks:
                engineeringPlan.risks ?? [],

            assumptions:
                engineeringPlan.assumptions ?? [],

            acceptanceCriteria:
                engineeringPlan.acceptanceCriteria ?? [],

            successMetrics:
                engineeringPlan.successMetrics ?? []

        });

    }

}