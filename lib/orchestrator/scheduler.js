// ── ANNEXE AI — Workflow Scheduler ───────────────────────────────────────────
//
// Determines which tasks in a workflow are ready to execute based on their
// dependency state. Works in concert with DependencyGraph.
//
// This is a pure scheduling layer — it does NOT execute tasks,
// modify the task queue, or call any agent directly.
//
// ─────────────────────────────────────────────────────────────────────────────

import { DependencyGraph } from "./graph.js";


export class WorkflowScheduler {

  constructor() {

    // One shared graph instance per scheduler.
    // For multi-workflow support, pass workflowId when registering deps.
    this._graph = new DependencyGraph();

  }


  // ── registerDependencies ────────────────────────────────────────────────────
  //
  // Convenience method to bulk-register sequential task dependencies
  // derived from a planner task list (tasks[n] depends on tasks[n-1]).
  //
  // Call this after createWorkflowPlan() and before the first schedule() call.
  //
  // @param {object[]} tasks - Ordered task array from WorkflowPlanner

  registerDependencies(tasks = []) {

    for (let i = 1; i < tasks.length; i++) {
      this._graph.addDependency(tasks[i].id, tasks[i - 1].id);
    }

  }


  // ── addDependency ───────────────────────────────────────────────────────────
  //
  // Explicitly register a single dependency between two tasks.
  // Use this for non-sequential or custom dependency graphs.
  //
  // @param {string} taskId          - The task to hold
  // @param {string} dependsOnTaskId - The task that must complete first

  addDependency(taskId, dependsOnTaskId) {

    this._graph.addDependency(taskId, dependsOnTaskId);

  }


  // ── schedule ────────────────────────────────────────────────────────────────
  //
  // Evaluate the pending task list against completed task IDs and return
  // all tasks that are cleared for execution.
  //
  // @param {object[]} tasks          - Array of pending task objects (must have `.id`)
  // @param {string[]} completedTasks - Array of already-completed task IDs
  // @param {DependencyGraph} [graph] - Optional external graph; falls back to
  //                                    the scheduler's own internal graph when
  //                                    omitted (backward-compatible).
  //
  // @returns {{ readyTasks: object[] }}

  schedule(tasks = [], completedTasks = [], graph = null) {

    // Use the caller-supplied graph when provided; otherwise fall back to the
    // internal graph registered via addDependency / registerDependencies.
    const activeGraph  = graph || this._graph;
    const completedSet = new Set(completedTasks);

    const readyTasks = tasks.filter(task => {

      // Skip tasks that are already completed
      if (completedSet.has(task.id)) return false;

      // Only release tasks whose dependencies are all satisfied
      return activeGraph.canExecute(task.id, completedTasks);

    });

    console.log(
      "SCHEDULER: tasks evaluated →",
      tasks.length,
      "| ready →",
      readyTasks.length
    );

    return { readyTasks };

  }

}
