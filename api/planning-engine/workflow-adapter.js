// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-7.1
// Engineering Plan → Workflow Adapter
// ───────────────────────────────────────────────────────────────

export default class WorkflowAdapter {

    convert(plan) {

        return {

            id: plan.planId,

            projectId: plan.projectId,

            name: plan.title,

            description: plan.summary,

            tasks: plan.engineeringTasks.map(task => ({

                id: task.id,

                name: task.name,

                priority: task.priority,

                dependencies: task.dependsOn || []

            }))

        };

    }

}