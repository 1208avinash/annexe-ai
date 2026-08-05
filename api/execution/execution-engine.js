// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.2.1
// Execution Engine
// Executable Workflow → Execution State
// ───────────────────────────────────────────────────────────────

import ExecutionState
    from "./contracts/execution-state.js";

export default class ExecutionEngine {

    start(workflow) {

        if (!workflow)
            throw new Error("Executable workflow is required.");

        const firstTask = workflow.pendingTasks[0] ?? null;

        return new ExecutionState({

            executionId:
                `EXEC-${Date.now()}`,

            workflowId:
                workflow.workflowId,

            projectId:
                workflow.projectId,

            planId:
                workflow.planId,

            status:
                firstTask ? "running" : "completed",

            currentStage:
                workflow.currentStage,

            currentTask:
                firstTask,

            currentWorker:
                firstTask ? "AI Engineer" : null,

            totalTasks:
                workflow.totalTasks,

            completedTasks: 0,

            failedTasks: 0,

            progress: 0,

            startedAt:
                new Date().toISOString(),

            history: [

                {
                    event: "execution_started",
                    workflowId: workflow.workflowId,
                    task: firstTask,
                    timestamp: new Date().toISOString()
                }

            ],

            errors: []

        });

    }

    completeTask(state, taskId) {

        if (!state)
            throw new Error("Execution state is required.");

        if (!taskId)
            throw new Error("Task ID is required.");

        state.completedTasks += 1;

        state.progress =
            state.totalTasks === 0
                ? 100
                : Math.round(
                    (state.completedTasks / state.totalTasks) * 100
                );

        state.history.push({

            event: "task_completed",

            task: taskId,

            timestamp:
                new Date().toISOString()

        });

        state.lastUpdated =
            new Date().toISOString();

        return state;

    }

    failTask(state, taskId, reason) {

        if (!state)
            throw new Error("Execution state is required.");

        state.failedTasks += 1;

        state.errors.push({

            task: taskId,

            reason,

            timestamp:
                new Date().toISOString()

        });

        state.history.push({

            event: "task_failed",

            task: taskId,

            timestamp:
                new Date().toISOString()

        });

        state.lastUpdated =
            new Date().toISOString();

        return state;

    }

}