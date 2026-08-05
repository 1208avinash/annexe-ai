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

        // ------------------------------------------------------
        // Build execution stages
        // ------------------------------------------------------

        const stages =
            this.buildStages(tasks);

        // ------------------------------------------------------
        // Build runtime workflow
        // ------------------------------------------------------

        return new ExecutableWorkflow({

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
                tasks.map(task =>
                    task.id ?? task.taskId
                ),

            activeTasks: [],

            completedTasks: [],

            failedTasks: [],

            totalTasks:
                tasks.length,

            completedCount: 0,

            failedCount: 0,

            progress: 0

        });

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
                        task.id ?? task.taskId
                    )

            }

        ];

    }

}