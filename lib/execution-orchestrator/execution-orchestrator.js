// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-7.2
// Execution Orchestrator
// ───────────────────────────────────────────────────────────────

import ExecutionJob from "./contracts/execution-job.js";

export default class ExecutionOrchestrator {

    createJobs(plan) {

        return plan.engineeringTasks.map(task => {

            return new ExecutionJob({

                jobId: `JOB-${task.id}`,

                planId: plan.planId,

                projectId: plan.projectId,

                taskId: task.id,

                worker: this.resolveWorker(task),

                priority: task.priority ?? "NORMAL",

                payload: {

                    task

                }

            });

        });

    }

    resolveWorker(task) {

        switch (task.id) {

            case "TASK-001":
                return "generation";

            case "TASK-002":
                return "generation";

            case "TASK-003":
                return "generation";

            case "TASK-004":
                return "patch";

            case "TASK-005":
                return "qa";

            default:
                return "generation";

        }

    }

}