// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 19.1
// Multi-Agent Task Scheduler
// Engineering Workflow Scheduler
// ───────────────────────────────────────────────────────────────

export default class TaskScheduler {

    schedule(workflow) {

        if (!workflow)
            throw new Error(
                "Workflow is required."
            );

        const tasks =
            workflow.tasks ??
            workflow.pendingTasks ??
            [];

        const pending =
            [...tasks];

        const scheduled = [];
        const completed = new Set();

        while (pending.length > 0) {

            const batch =
                pending.filter(task => {

                    const deps =
                        task.dependencies ??
                        task.dependsOn ??
                        [];

                    return deps.every(
                        dependency =>
                            completed.has(
                                dependency
                            )
                    );

                });

            if (batch.length === 0)

                throw new Error(

                    "Circular dependency detected."

                );

            scheduled.push(batch);

            for (const task of batch) {

                completed.add(
                    task.taskId ?? task.id
                );

            }

            for (const task of batch) {

                const index =
                    pending.indexOf(task);

                pending.splice(
                    index,
                    1
                );

            }

        }

        return {

            workflowId:
                workflow.workflowId,

            batches:
                scheduled,

            totalBatches:
                scheduled.length,

            totalTasks:
                tasks.length

        };

    }

}
