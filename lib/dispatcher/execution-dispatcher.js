// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.4
// Execution Dispatcher
// Dispatches execution to workers
// ───────────────────────────────────────────────────────────────

export default class ExecutionDispatcher {

    async dispatch(worker, workflow, executionState) {

        if (!worker)
            throw new Error("Worker is required.");

        if (!workflow)
            throw new Error("Workflow is required.");

        if (!executionState)
            throw new Error("Execution state is required.");

        // ------------------------------------------------------
        // Locate current task
        // ------------------------------------------------------

        const taskId = executionState.currentTask;

        if (!taskId)
            throw new Error("No active task.");

        const task =
            workflow.stages
                .flatMap(stage => stage.taskIds || [])
                .includes(taskId)
                ? {

                    taskId,

                    title: taskId,

                    status: "pending"

                }
                : null;

        if (!task)
            throw new Error(`Task ${taskId} not found.`);

        // ------------------------------------------------------
        // Execute
        // ------------------------------------------------------

        const result =
            await worker.execute(
                task,
                executionState
            );

        return {

            success: result.success,

            worker: result.workerType,

            taskId,

            result

        };

    }

}