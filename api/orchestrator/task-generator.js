// ── ANNEXE AI — Workflow Task Generator ──────────────────────────────────────
//
// Converts workflow phase tasks into executable orchestrator task descriptors.
// Pure transformation layer — no agents are called, no queue is modified.
//
// Storage: none — returns a plain result object each call.
// Phase 4: pass generated tasks directly into the TaskQueue adapter.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Agent → task type map ─────────────────────────────────────────────────────
//
// Maps every known agent/worker key to its orchestrator task type.
// Unknown agents default to CODE_GENERATION.

const AGENT_TYPE_MAP = {
  architect_agent:    "ARCHITECTURE",
  frontend_worker:    "CODE_GENERATION",
  backend_worker:     "CODE_GENERATION",
  database_worker:    "DATABASE",
  testing_worker:     "TESTING",
  review_worker:      "REVIEW",
  ai_worker:          "CODE_GENERATION",
  auth_worker:        "CODE_GENERATION",
  billing_worker:     "CODE_GENERATION",
  crm_worker:         "CODE_GENERATION",
  automation_worker:  "CODE_GENERATION",
  generation_worker:  "CODE_GENERATION"
};


// ── Phase name → priority map ─────────────────────────────────────────────────
//
// Matches on lowercase phase name substrings.
// First match wins; falls back to MEDIUM.

const PRIORITY_RULES = [
  { match: "architecture", priority: "HIGH"   },
  { match: "backend",      priority: "HIGH"   },
  { match: "review",       priority: "HIGH"   },
  { match: "frontend",     priority: "MEDIUM" },
  { match: "testing",      priority: "MEDIUM" },
  { match: "database",     priority: "HIGH"   },
  { match: "auth",         priority: "HIGH"   },
  { match: "billing",      priority: "HIGH"   },
  { match: "ai layer",     priority: "HIGH"   }
];

function resolvePriority(phaseName = "") {

  const lower = phaseName.toLowerCase();

  const rule = PRIORITY_RULES.find(r => lower.includes(r.match));

  return rule ? rule.priority : "MEDIUM";

}


// ── ID generator ──────────────────────────────────────────────────────────────

function generateTaskId(workflowId, agentKey, index) {

  const agentSlug = agentKey.toUpperCase().replace(/_/g, "-");
  const seq       = String(index + 1).padStart(3, "0");

  return `EXEC-${workflowId}-${seq}-${agentSlug}`;

}


// ── WorkflowTaskGenerator ─────────────────────────────────────────────────────

export class WorkflowTaskGenerator {


  // ── generateTasks ───────────────────────────────────────────────────────────
  //
  // Convert a workflow's task list into executable orchestrator task descriptors.
  //
  // @param {object}   workflow
  // @param {string}   workflow.id        - Workflow ID (e.g. "WF-001")
  // @param {string}   workflow.projectId - Parent project ID
  // @param {object[]} workflow.tasks     - Planner-generated task list
  //
  // @returns {{ success: boolean, workflowId: string, tasks: object[] }}

  generateTasks(workflow = {}) {

    const { id: workflowId = "WF-UNKNOWN", projectId = null, tasks = [] } = workflow;

    if (!tasks.length) {
      console.warn("TASK GENERATOR: no tasks found in workflow →", workflowId);
      return { success: false, workflowId, tasks: [] };
    }

    const executableTasks = tasks.map((task, index) => {

      const type     = AGENT_TYPE_MAP[task.agent] || "CODE_GENERATION";
      const priority = resolvePriority(task.name || "");

      return {
        id:          generateTaskId(workflowId, task.agent || "unknown", index),
        sourceTaskId: task.id,          // reference back to planner task
        workflowId,
        projectId,
        name:        task.name  || "Unnamed Task",
        type,
        agent:       task.agent || null,
        priority,
        status:      "QUEUED",
        phase:       task.phase || index + 1,
        createdAt:   new Date().toISOString()
      };

    });

    console.log(
      "TASK GENERATOR: workflow →", workflowId,
      "| tasks generated →", executableTasks.length
    );

    return {
      success:    true,
      workflowId,
      tasks:      executableTasks
    };

  }

}
