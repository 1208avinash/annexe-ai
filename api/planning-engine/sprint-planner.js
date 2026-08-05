// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.5.4
// Sprint Planner
// ───────────────────────────────────────────────────────────────

export default class SprintPlanner {

    plan(tasks) {

        return [

            {

                sprint: 1,

                name: "Foundation",

                tasks: tasks.filter(t =>
                    t.id === "TASK-001"
                )

            },

            {

                sprint: 2,

                name: "Core Development",

                tasks: tasks.filter(t =>
                    ["TASK-002","TASK-003","TASK-004"]
                    .includes(t.id)
                )

            },

            {

                sprint: 3,

                name: "Testing & Delivery",

                tasks: tasks.filter(t =>
                    t.id === "TASK-005"
                )

            }

        ];

    }

}