// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.5.2
// Task Planner
// ───────────────────────────────────────────────────────────────

export default class TaskPlanner {

    plan(decision) {

        if (!decision.approved) {

            return [];

        }

        return [

            {
                id: "TASK-001",
                name: "Project Setup",
                priority: "High"
            },

            {
                id: "TASK-002",
                name: "Backend Development",
                priority: "High"
            },

            {
                id: "TASK-003",
                name: "Frontend Development",
                priority: "High"
            },

            {
                id: "TASK-004",
                name: "Database Design",
                priority: "Medium"
            },

            {
                id: "TASK-005",
                name: "Testing & QA",
                priority: "High"
            }

        ];

    }

}