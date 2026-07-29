// ── ANNEXE AI — Workflow Runner ───────────────────────────────────────────────
//
// Prepares and tracks workflow execution runs.
// Bridges the Workflow Manager → Task Generator → execution layer.
//
// This class does NOT call agents, push to TaskQueue, or execute workers.
// It produces a ready-to-execute run snapshot that the engine can consume.
//
// Storage: in-memory Map — no database, no external dependencies.
// Phase 4: replace store with Vercel KV / Postgres adapter.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Valid run statuses ────────────────────────────────────────────────────────

const VALID_STATUSES = new Set([
  "CREATED",
  "RUNNING",
  "COMPLETED",
  "FAILED"
]);


// ── WorkflowRunner ────────────────────────────────────────────────────────────

export class WorkflowRunner {


  // ── Constructor ─────────────────────────────────────────────────────────────
  //
  // @param {WorkflowTaskGenerator} taskGenerator - Injected task generator instance

  constructor(taskGenerator) {

    if (!taskGenerator || typeof taskGenerator.generateTasks !== "function") {
      throw new Error("WorkflowRunner: taskGenerator with generateTasks() is required");
    }

    this._taskGenerator = taskGenerator;

    // Map<workflowId, run>
    this._runs = new Map();

  }


  // ── createRun ───────────────────────────────────────────────────────────────
  //
  // Generate executable tasks from a workflow and store the run snapshot.
  //
  // @param {object} workflow - Workflow object from WorkflowManager
  //
  // @returns {{
  //   success:    boolean,
  //   workflowId: string,
  //   runId:      string,
  //   status:     string,
  //   tasks:      object[]
  // }}

  createRun(workflow = {}) {

    const workflowId = workflow.id || "WF-UNKNOWN";

    // ── Generate executable tasks ─────────────────────────────────────────────

    const generated = this._taskGenerator.generateTasks(workflow);

    if (!generated.success) {

      console.error("WORKFLOW RUNNER: task generation failed →", workflowId);

      return {
        success:    false,
        workflowId,
        runId:      null,
        status:     "FAILED",
        tasks:      []
      };

    }

    // ── Build run record ──────────────────────────────────────────────────────

    const runId = "RUN-" + workflowId + "-" + Date.now();

    const run = {
      runId,
      workflowId,
      projectId:  workflow.projectId || null,
      status:     "CREATED",
      tasks:      generated.tasks,
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      startedAt:  null,
      completedAt: null
    };

    this._runs.set(workflowId, run);

    console.log(
      "WORKFLOW RUNNER: run created →", runId,
      "| tasks →", run.tasks.length
    );

    return {
      success:    true,
      workflowId,
      runId,
      status:     run.status,
      tasks:      run.tasks
    };

  }


  // ── getRun ──────────────────────────────────────────────────────────────────
  //
  // Return the current execution snapshot for a workflow.
  //
  // @param  {string}      workflowId
  // @returns {object|null}

  getRun(workflowId) {

    return this._runs.get(workflowId) || null;

  }


  // ── updateRunStatus ─────────────────────────────────────────────────────────
  //
  // Transition a run to a new status.
  // Sets startedAt when transitioning to RUNNING.
  // Sets completedAt when transitioning to COMPLETED or FAILED.
  //
  // @param  {string}      workflowId
  // @param  {string}      status     - One of: CREATED | RUNNING | COMPLETED | FAILED
  // @returns {object|null}            - Updated run, or null if not found / invalid

  updateRunStatus(workflowId, status) {

    if (!VALID_STATUSES.has(status)) {
      console.error("WORKFLOW RUNNER: invalid status →", status);
      return null;
    }

    const run = this._runs.get(workflowId);

    if (!run) {
      console.error("WORKFLOW RUNNER: run not found →", workflowId);
      return null;
    }

    const now = new Date().toISOString();

    run.status    = status;
    run.updatedAt = now;

    if (status === "RUNNING" && !run.startedAt) {
      run.startedAt = now;
    }

    if (status === "COMPLETED" || status === "FAILED") {
      run.completedAt = now;
    }

    this._runs.set(workflowId, run);

    console.log("WORKFLOW RUNNER: status →", workflowId, "→", status);

    return run;

  }


  // ── submitToQueue ───────────────────────────────────────────────────────────
  //
  // Submit all executable tasks from a workflow run into the ANNEXE TaskQueue.
  // The run must already exist (call createRun first).
  //
  // @param {string} workflowId  - Workflow ID whose run tasks will be submitted
  // @param {object} taskQueue   - TaskQueue instance exposing addTask()
  //
  // @returns {{
  //   success:    boolean,
  //   workflowId: string,
  //   submitted:  number,
  //   tasks:      object[]
  // }}

  submitToQueue(workflowId, taskQueue) {

    // ── Validate run exists ───────────────────────────────────────────────────

    const run = this._runs.get(workflowId);

    if (!run) {
      console.error("WORKFLOW RUNNER: submitToQueue — run not found →", workflowId);
      return { success: false, workflowId, submitted: 0, tasks: [] };
    }

    // ── Validate taskQueue ────────────────────────────────────────────────────

    if (!taskQueue || typeof taskQueue.addTask !== "function") {
      console.error("WORKFLOW RUNNER: submitToQueue — invalid taskQueue →", workflowId);
      return { success: false, workflowId, submitted: 0, tasks: [] };
    }

    // ── Convert and submit each task ──────────────────────────────────────────

    const submitted = [];

    for (const task of run.tasks) {

      const queueTask = {
        id:         task.id,
        projectId:  task.projectId,
        type:       task.type,
        agent:      task.agent,
        priority:   task.priority,
        workflowId: task.workflowId
      };

      taskQueue.addTask(queueTask);

      submitted.push(queueTask);

    }

    console.log(
      "WORKFLOW RUNNER: submitted →", workflowId,
      "| tasks →", submitted.length
    );

    return {
      success:    true,
      workflowId,
      submitted:  submitted.length,
      tasks:      submitted
    };

  }

}
