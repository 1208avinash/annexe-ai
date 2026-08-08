// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.1
// Engineering Context Builder
// Builds complete engineering context for AI execution
// ───────────────────────────────────────────────────────────────

export default class EngineeringContextBuilder {

    build({

        engineeringPlan,

        executionState,

        task,

        project = {},

        repository = {},

        standards = {}

    }) {

        if (!engineeringPlan)
            throw new Error("Engineering plan is required.");

        if (!task)
            throw new Error("Engineering task is required.");

        return {

            contextId:
                `CTX-${Date.now()}`,

            generatedAt:
                new Date().toISOString(),

            project: {

                id:
                    engineeringPlan.projectId,

                name:
                    project.name ?? "",

                description:
                    project.description ?? ""

            },

            architecture: {

                frontend:
                    engineeringPlan.frontend ?? null,

                backend:
                    engineeringPlan.backend ?? null,

                database:
                    engineeringPlan.database ?? null,

                deployment:
                    engineeringPlan.deployment ?? null

            },

            execution: {

                executionId:
                    executionState?.executionId ?? null,

                workflowId:
                    executionState?.workflowId ?? null

            },

            task: {

                id:
                    task.taskId ?? task.id,

                title:
                    task.title ?? "",

                description:
                    task.description ?? "",

                requirements:
                    task.requirements ?? []

            },

            repository: {

                branch:
                    repository.branch ?? "main",

                existingFiles:
                    repository.files ?? []

            },

            standards: {

                language:
                    standards.language ?? "",

                framework:
                    standards.framework ?? "",

                linting:
                    standards.linting ?? "",

                formatting:
                    standards.formatting ?? "",

                testing:
                    standards.testing ?? ""

            }

        };

    }

}