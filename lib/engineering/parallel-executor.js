// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 19.3
// Parallel Executor
// Executes Engineering Batches Concurrently
// ───────────────────────────────────────────────────────────────

export default class ParallelExecutor {

    constructor({

        engineeringDirector

    }) {

        if (!engineeringDirector)
            throw new Error(
                "EngineeringDirector is required."
            );

        this.engineeringDirector =
            engineeringDirector;

    }

    // ----------------------------------------------------------
    // Execute Scheduled Workflow
    // ----------------------------------------------------------

    async execute(schedule) {

        if (!schedule)
            throw new Error(
                "Task schedule is required."
            );

        const completed = [];

        for (const batch of schedule.batches) {

            const workflow = {

                workflowId:
                    schedule.workflowId,

                tasks:
                    batch

            };

            const result =
                await this.engineeringDirector.execute(
                    workflow
                );

            completed.push(result);

        }

        return {

            workflowId:
                schedule.workflowId,

            batches:
                completed.length,

            completed

        };

    }

}