// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-7.2
// Engineering Plan Execution Bridge
// ───────────────────────────────────────────────────────────────

import WorkflowAdapter from "./workflow-adapter.js";

export default class ExecutionBridge {

    constructor(workflowPlanner) {

        this.workflowPlanner = workflowPlanner;

        this.adapter = new WorkflowAdapter();

    }

    createWorkflow(plan) {

        const workflow =
            this.adapter.convert(plan);

        return this.workflowPlanner.createWorkflowPlan({

            name: workflow.name,

            description: workflow.description,

            requirements:

                workflow.tasks.map(t => t.name)

        });

    }

}