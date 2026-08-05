// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.5.5
// Planning Engine
// ───────────────────────────────────────────────────────────────

import EngineeringPlan from "./contracts/engineering-plan.js";
import TaskPlanner from "./task-planner.js";
import DependencyPlanner from "./dependency-planner.js";
import SprintPlanner from "./sprint-planner.js";

export default class PlanningEngine {

    constructor() {

        this.taskPlanner = new TaskPlanner();
        this.dependencyPlanner = new DependencyPlanner();
        this.sprintPlanner = new SprintPlanner();

    }

    createPlan(decision) {

        const tasks =
            this.taskPlanner.plan(decision);

        const dependencyGraph =
            this.dependencyPlanner.build(tasks);

        const sprints =
            this.sprintPlanner.plan(dependencyGraph);

        return new EngineeringPlan({

            planId: `PLAN-${Date.now()}`,

            decisionId: decision.decisionId,

            projectId: decision.projectId,

            title: "Engineering Execution Plan",

            summary: "Automatically generated engineering plan.",

            engineeringTasks: dependencyGraph,

            dependencies: dependencyGraph,

            milestones: sprints,

            executionOrder:
                dependencyGraph.map(t => t.id),

            estimatedDuration: "12 weeks",

            estimatedCost: "TBD",

            recommendedTeam: [

                "AI CTO",

                "AI Architect",

                "AI Engineer"

            ],

            risks: []

        });

    }

}