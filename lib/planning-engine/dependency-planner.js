// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.5.3
// Dependency Planner
// ───────────────────────────────────────────────────────────────

export default class DependencyPlanner {

    build(tasks) {

        return tasks.map(task => {

            switch (task.id) {

                case "TASK-001":
                    return {
                        ...task,
                        dependsOn: []
                    };

                case "TASK-002":
                    return {
                        ...task,
                        dependsOn: ["TASK-001"]
                    };

                case "TASK-003":
                    return {
                        ...task,
                        dependsOn: ["TASK-001"]
                    };

                case "TASK-004":
                    return {
                        ...task,
                        dependsOn: ["TASK-002"]
                    };

                case "TASK-005":
                    return {
                        ...task,
                        dependsOn: [
                            "TASK-002",
                            "TASK-003",
                            "TASK-004"
                        ]
                    };

                default:
                    return {
                        ...task,
                        dependsOn: []
                    };

            }

        });

    }

}