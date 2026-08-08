// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.1.1
// Workflow Generator
// Engineering Plan → Executable Workflow
// ───────────────────────────────────────────────────────────────

import ExecutableWorkflow
    from "./contracts/executable-workflow.js";

export default class WorkflowGenerator {

    generate(plan) {

        if (!plan)
            throw new Error("Engineering plan is required.");

        const tasks =
            Array.isArray(plan.engineeringTasks)
                ? plan.engineeringTasks
                : [];

        const normalizedTasks =
            tasks.map((task, index) => ({
                ...task,
                id:
                    task.id ??
                    task.taskId ??
                    `TASK-${String(index + 1).padStart(3, "0")}`,
                taskId:
                    task.taskId ??
                    task.id ??
                    `TASK-${String(index + 1).padStart(3, "0")}`,
                dependencies:
                    task.dependencies ??
                    task.dependsOn ??
                    []
            }));

        // ------------------------------------------------------
        // Build execution stages
        // ------------------------------------------------------

        const stages =
            this.buildStages(normalizedTasks);

        // ------------------------------------------------------
        // Build runtime workflow
        // ------------------------------------------------------

        const workflow = new ExecutableWorkflow({

            workflowId:
                `WF-${Date.now()}`,

            projectId:
                plan.projectId,

            planId:
                plan.planId,

            status:
                "pending",

            currentStage:
                stages.length > 0 ? 1 : 0,

            stages,

            pendingTasks:
                   normalizedTasks,

            activeTasks: [],

            completedTasks: [],

            failedTasks: [],

            totalTasks:
            normalizedTasks.length,

            completedCount: 0,

            failedCount: 0,

            progress: 0

        });

        workflow.tasks = normalizedTasks;

        return workflow;

    }

    // ----------------------------------------------------------
    // Stage Builder
    // ----------------------------------------------------------

    buildStages(tasks = []) {

        if (tasks.length === 0)
            return [];

        return [

            {

                stage: 1,

                name: "Engineering",

                executionMode: "sequential",

                worker: "AI Engineer",

                taskIds:
                    tasks.map(task =>
                        task.taskId ?? task.id
                    )

            }

        ];

    }

}
