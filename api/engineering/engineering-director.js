// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 15.3
// Engineering Director
// Engineering Specification → Execution Plan
// ───────────────────────────────────────────────────────────────

import ExecutionPlan
    from "./execution-plan.js";

export default class EngineeringDirector {

    constructor({ engineerRegistry = null } = {}) {

        this.engineerRegistry = engineerRegistry;

    }

    createExecutionPlan(specification) {

        if (!specification)
            throw new Error(
                "EngineeringSpecification is required."
            );

        const workers = [];

        const stages = [];

        const dependencies = [];

        // ------------------------------------------------------
        // Stage 1
        // Backend + Database (Parallel)
        // ------------------------------------------------------

        const stage1Workers = [];

        if (
            specification.backend?.services?.length
        ) {

            stage1Workers.push(
                "Backend Worker"
            );

            workers.push(
                "Backend Worker"
            );

        }

        if (
            specification.database?.entities?.length
        ) {

            stage1Workers.push(
                "Database Worker"
            );

            workers.push(
                "Database Worker"
            );

        }

        if (stage1Workers.length) {

            stages.push({

                stage: 1,

                name:
                    "Backend Foundation",

                parallel: true,

                workers:
                    stage1Workers

            });

        }

        // ------------------------------------------------------
        // Stage 2
        // Frontend
        // ------------------------------------------------------

        if (
            specification.frontend?.modules?.length
        ) {

            stages.push({

                stage: 2,

                name:
                    "Frontend",

                parallel: false,

                workers: [

                    "Frontend Worker"

                ]

            });

            workers.push(
                "Frontend Worker"
            );

            dependencies.push({

                from: 1,

                to: 2

            });

        }

        // ------------------------------------------------------
        // Stage 3
        // QA
        // ------------------------------------------------------

        if (
            specification.testing?.unit ||

            specification.testing?.integration ||

            specification.testing?.e2e
        ) {

            stages.push({

                stage: 3,

                name:
                    "Quality Assurance",

                parallel: false,

                workers: [

                    "QA Worker"

                ]

            });

            workers.push(
                "QA Worker"
            );

            dependencies.push({

                from: 2,

                to: 3

            });

        }

        // ------------------------------------------------------
        // Stage 4
        // Documentation
        // ------------------------------------------------------

        if (
            specification.documentation === true
        ) {

            stages.push({

                stage: 4,

                name:
                    "Documentation",

                parallel: false,

                workers: [

                    "Documentation Worker"

                ]

            });

            workers.push(
                "Documentation Worker"
            );

            dependencies.push({

                from: 3,

                to: 4

            });

        }

        // ------------------------------------------------------
        // Stage 5
        // Deployment
        // ------------------------------------------------------

        if (
            specification.deployment?.platform
        ) {

            stages.push({

                stage: 5,

                name:
                    "Deployment",

                parallel: false,

                workers: [

                    "Deployment Worker"

                ]

            });

            workers.push(
                "Deployment Worker"
            );

            dependencies.push({

                from: 4,

                to: 5

            });

        }

        return new ExecutionPlan({

            specificationId:
                specification.specificationId,

            projectId:
                specification.project.id,

            strategy:
                "parallel-where-possible",

            priority:
                "normal",

            stages,

            requiredWorkers:

                [...new Set(workers)],

            dependencies

        });

    }

    async execute(workflow) {

        if (!workflow)
            throw new Error(
                "Workflow is required."
            );

        const results = [];

        for (const task of workflow.tasks ?? []) {

            results.push({
                taskId: task.taskId ?? task.id ?? null,
                worker: task.worker ?? task.requiredRole ?? "Engineering Worker",
                status: "COMPLETED",
                result: {
                    taskId: task.taskId ?? task.id ?? null,
                    name: task.name ?? "",
                    completed: true
                }
            });

        }

        return {
            workflowId: workflow.workflowId ?? null,
            completed: results.length,
            results
        };

    }

}
