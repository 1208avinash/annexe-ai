// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 18.7
// Engineering Director V2
// Autonomous Engineering Orchestrator
// ───────────────────────────────────────────────────────────────

export default class EngineeringDirectorV2 {

    constructor({

        engineerRegistry

    }) {

        if (!engineerRegistry)
            throw new Error(
                "EngineerRegistry is required."
            );

        this.engineerRegistry =
            engineerRegistry;

    }

    // ----------------------------------------------------------
    // Execute Workflow
    // ----------------------------------------------------------

    async execute(workflow) {

        if (!workflow)
            throw new Error(
                "Workflow is required."
            );

        const results = [];

        for (const task of workflow.tasks ?? []) {

            const engineer =

                this.selectEngineer(
                    task
                );

            if (!engineer)
                throw new Error(

                    `No engineer available for '${task.requiredRole}'.`

                );

            const result =

                await engineer.execute(
                    task
                );

            results.push({

                taskId:
                    task.taskId,

                engineer:
                    engineer.role,

                result

            });

        }

        return {

            workflowId:
                workflow.workflowId,

            completed:
                results.length,

            results

        };

    }

    // ----------------------------------------------------------
    // Engineer Selection
    // ----------------------------------------------------------

    selectEngineer(task) {

        if (!task)
            return null;

        if (task.requiredRole) {

            const engineer =

                this.engineerRegistry
                    .getBestEngineer(
                        task.requiredRole
                    );

            if (engineer)
                return engineer;

        }

        if (task.category) {

            const engineers =

                this.engineerRegistry
                    .findByCapability(
                        task.category
                    );

            if (engineers.length > 0)
                return engineers[0];

        }

        return null;

    }

}