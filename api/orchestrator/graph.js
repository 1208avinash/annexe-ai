// ── ANNEXE AI — Dependency Graph Manager ─────────────────────────────────────
//
// Manages task dependency relationships for the workflow engine.
// A task may only execute once all tasks it depends on are completed.
//
// Storage: in-memory Map — no database, no external dependencies.
// Phase 4: replace with Vercel KV / Postgres adapter.
//
// ─────────────────────────────────────────────────────────────────────────────

export class DependencyGraph {

  constructor() {

    // Map<taskId, Set<dependsOnTaskId>>
    this._graph = new Map();

  }


  // ── addDependency ───────────────────────────────────────────────────────────
  //
  // Register that `taskId` must wait for `dependsOnTaskId` to complete.
  //
  // @param {string} taskId          - The dependent task
  // @param {string} dependsOnTaskId - The task that must complete first

  addDependency(taskId, dependsOnTaskId) {

    if (!this._graph.has(taskId)) {
      this._graph.set(taskId, new Set());
    }

    this._graph.get(taskId).add(dependsOnTaskId);

    // Ensure the dependency itself has an entry (even if it has no deps of its own)
    if (!this._graph.has(dependsOnTaskId)) {
      this._graph.set(dependsOnTaskId, new Set());
    }

  }


  // ── getDependencies ─────────────────────────────────────────────────────────
  //
  // Return all task IDs that `taskId` directly depends on.
  //
  // @param  {string}   taskId
  // @returns {string[]}

  getDependencies(taskId) {

    const deps = this._graph.get(taskId);

    return deps ? Array.from(deps) : [];

  }


  // ── canExecute ──────────────────────────────────────────────────────────────
  //
  // Return true if every dependency of `taskId` appears in `completedTasks`.
  //
  // @param  {string}   taskId
  // @param  {string[]} completedTasks - Array of already-completed task IDs
  // @returns {boolean}

  canExecute(taskId, completedTasks = []) {

    const deps = this.getDependencies(taskId);

    if (!deps.length) return true;

    const completed = new Set(completedTasks);

    return deps.every(dep => completed.has(dep));

  }


  // ── getReadyTasks ───────────────────────────────────────────────────────────
  //
  // From a list of pending tasks, return those whose dependencies are satisfied.
  //
  // @param  {object[]} tasks          - Array of task objects (must have `.id`)
  // @param  {string[]} completedTasks - Array of already-completed task IDs
  // @returns {object[]}

  getReadyTasks(tasks = [], completedTasks = []) {

    return tasks.filter(task => this.canExecute(task.id, completedTasks));

  }

}
