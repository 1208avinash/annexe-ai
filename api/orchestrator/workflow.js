// ── ANNEXE AI — Workflow Manager ─────────────────────────────────────────────
//
// Manages the full lifecycle of ANNEXE project workflows.
// Each workflow groups an ordered set of tasks under a single project.
//
// Storage: in-memory Map — no database, no external dependencies.
// Phase 4: replace with Vercel KV / Postgres adapter.
//
// Workflow statuses:
//   CREATED    — initialised, not yet planned
//   PLANNING   — planner is building the task list
//   RUNNING    — at least one task is executing
//   COMPLETED  — all tasks finished successfully
//   FAILED     — a critical task failed; workflow halted
//
// ─────────────────────────────────────────────────────────────────────────────

export class WorkflowManager {

  constructor() {

    // Map<workflowId, workflow>
    this._workflows = new Map();

  }


  // ── createWorkflow ──────────────────────────────────────────────────────────
  //
  // Initialise a new workflow record for a project.
  //
  // @param {string} projectId  - ANNEXE project ID (e.g. "ANNEXE-1234567890")
  // @param {object} [template] - Optional pre-built task list from the planner
  // @returns {object}          - Newly created workflow record

  createWorkflow(projectId, template = {}) {

    const id = "WF-" + Date.now();

    const workflow = {
      id,
      projectId,
      name:      template.name   || "ANNEXE Workflow",
      status:    "CREATED",
      tasks:     template.tasks  || [],
      phases:    template.phases || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this._workflows.set(id, workflow);

    console.log("WORKFLOW CREATED:", id, "→", projectId);

    return workflow;

  }


  // ── updateWorkflowStatus ────────────────────────────────────────────────────
  //
  // Transition a workflow to a new status.
  //
  // @param {string} id      - Workflow ID
  // @param {string} status  - One of: CREATED | PLANNING | RUNNING | COMPLETED | FAILED
  // @returns {object|null}  - Updated workflow, or null if not found

  updateWorkflowStatus(id, status) {

    const VALID_STATUSES = [
      "CREATED",
      "PLANNING",
      "RUNNING",
      "COMPLETED",
      "FAILED"
    ];

    if (!VALID_STATUSES.includes(status)) {
      console.error("WORKFLOW: invalid status →", status);
      return null;
    }

    const workflow = this._workflows.get(id);

    if (!workflow) {
      console.error("WORKFLOW NOT FOUND:", id);
      return null;
    }

    workflow.status    = status;
    workflow.updatedAt = new Date().toISOString();

    this._workflows.set(id, workflow);

    console.log("WORKFLOW STATUS:", id, "→", status);

    return workflow;

  }


  // ── getWorkflow ─────────────────────────────────────────────────────────────
  //
  // Retrieve a single workflow by ID.
  //
  // @param  {string}      id
  // @returns {object|null}

  getWorkflow(id) {

    return this._workflows.get(id) || null;

  }


  // ── getWorkflows ────────────────────────────────────────────────────────────
  //
  // Return all stored workflows as an array.
  //
  // @returns {object[]}

  getWorkflows() {

    return Array.from(this._workflows.values());

  }

}
