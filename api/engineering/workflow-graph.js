// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 19.2
// Workflow Graph
// Engineering Dependency Graph
// ───────────────────────────────────────────────────────────────

export default class WorkflowGraph {

    constructor() {

        this.nodes = new Map();

    }

    // ----------------------------------------------------------
    // Build Graph
    // ----------------------------------------------------------

    build(tasks = []) {

        this.nodes.clear();

        for (const task of tasks) {

            const taskId =
                task.taskId ??
                task.id;

            this.nodes.set(

                taskId,

                {

                    task,

                    dependencies:
                        [...(task.dependencies ?? task.dependsOn ?? [])],

                    dependents: []

                }

            );

        }

        for (const node of this.nodes.values()) {

            for (const dependency of node.dependencies) {

                const parent =
                    this.nodes.get(dependency);

                if (parent)

                    parent.dependents.push(
                        node.task.taskId ?? node.task.id
                    );

            }

        }

        return this;

    }

    // ----------------------------------------------------------
    // Queries
    // ----------------------------------------------------------

    get(taskId) {

        return this.nodes.get(taskId) ?? null;

    }

    getRoots() {

        return Array.from(

            this.nodes.values()

        ).filter(

            node =>

                node.dependencies.length === 0

        );

    }

    getLeaves() {

        return Array.from(

            this.nodes.values()

        ).filter(

            node =>

                node.dependents.length === 0

        );

    }

    getTasks() {

        return Array.from(

            this.nodes.values()

        ).map(

            node =>

                node.task

        );

    }

    count() {

        return this.nodes.size;

    }

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    hasCircularDependency() {

        const visited =
            new Set();

        const recursion =
            new Set();

        const visit = taskId => {

            if (recursion.has(taskId))
                return true;

            if (visited.has(taskId))
                return false;

            visited.add(taskId);

            recursion.add(taskId);

            const node =
                this.nodes.get(taskId);

            if (!node)
                return false;

            for (const dependency of node.dependencies) {

                if (visit(dependency))
                    return true;

            }

            recursion.delete(taskId);

            return false;

        };

        for (const taskId of this.nodes.keys()) {

            if (visit(taskId))
                return true;

        }

        return false;

    }

}
