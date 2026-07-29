// ── ANNEXE AI — Coding Task Manager ──────────────────────────────────────────
//
// Converts development plans into executable coding tasks, tracks lifecycle,
// and assigns tasks to specialised AI engineering agents.
//
// Storage is in-memory with a clean abstraction boundary — swap the
// storageAdapter object for a PostgreSQL adapter without changing any caller.
// ─────────────────────────────────────────────────────────────────────────────

import { validateTransition, STATUSES } from "./lifecycle.js";
import { validateTask }                 from "./validator.js";


// ── Agent assignment rules ────────────────────────────────────────────────────

const AGENT_RULES = [
  { keywords: ["llm", "model", "prompt", "agent", "ai", "embedding", "vector", "rag", "workflow", "inference", "machine learning", "automation"], agent: "ai_coding_agent"       },
  { keywords: ["schema", "database", "migration", "table", "query", "index", "seed", "orm"],                                                       agent: "database_coding_agent"  },
  { keywords: ["api", "server", "authentication", "auth", "backend", "service", "endpoint", "route", "middleware"],                                agent: "backend_coding_agent"   },
  { keywords: ["ui", "component", "page", "dashboard", "frontend", "layout", "style", "css", "react", "next"],                                    agent: "frontend_coding_agent"  }
];

function assignAgent(title = "", description = "") {
  const text = (title + " " + description).toLowerCase();
  for (const rule of AGENT_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) return rule.agent;
  }
  return "general_coding_agent";
}

function inferDepartment(agent) {
  const map = {
    frontend_coding_agent:  "frontend",
    backend_coding_agent:   "backend",
    database_coding_agent:  "database",
    ai_coding_agent:        "ai",
    general_coding_agent:   "general"
  };
  return map[agent] || "general";
}

function inferPriority(title = "") {
  const norm = title.toLowerCase();
  if (norm.includes("auth") || norm.includes("security") || norm.includes("database schema")) return "high";
  if (norm.includes("api") || norm.includes("service") || norm.includes("migration"))         return "high";
  if (norm.includes("test") || norm.includes("deploy") || norm.includes("monitor"))           return "low";
  return "medium";
}

function generateTaskId(projectId, index) {
  return `TASK-${projectId}-${String(index + 1).padStart(4, "0")}`;
}


// ── In-memory storage adapter ─────────────────────────────────────────────────
//
// Replace this object with a PostgreSQL adapter when ready.
// All manager methods call ONLY through this interface — never touch _store directly.

const storageAdapter = {
  _store: new Map(),   // projectId → task[]

  save(projectId, tasks) {
    this._store.set(projectId, tasks);
  },

  findByProject(projectId) {
    return this._store.get(projectId) || [];
  },

  findById(taskId) {
    for (const tasks of this._store.values()) {
      const found = tasks.find(t => t.id === taskId);
      if (found) return { task: found, tasks };
    }
    return null;
  },

  upsert(projectId, updatedTask) {
    const tasks = this.findByProject(projectId);
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index === -1) return false;
    tasks[index] = updatedTask;
    this.save(projectId, tasks);
    return true;
  }
};


// ── CodingTaskManager ─────────────────────────────────────────────────────────

export class CodingTaskManager {

  /**
   * createTasks
   *
   * Converts a development plan into an array of executable coding tasks
   * and persists them to the storage adapter.
   *
   * @param {string} projectId
   * @param {object} developmentPlan  - { phases: [{ name, tasks: string[] }] }
   * @returns {{ success, tasks, errors }}
   */
  createTasks(projectId, developmentPlan) {

    if (!projectId)       return { success: false, tasks: [], errors: ["projectId is required"] };
    if (!developmentPlan) return { success: false, tasks: [], errors: ["developmentPlan is required"] };

    const phases = developmentPlan.phases || [];
    const now    = new Date().toISOString();
    const created = [];
    const errors  = [];
    let   globalIndex = storageAdapter.findByProject(projectId).length;

    for (const phase of phases) {
      const phaseName  = phase.name  || "General";
      const phaseTasks = phase.tasks || [];

      for (const taskTitle of phaseTasks) {

        const agent      = assignAgent(taskTitle, phaseName);
        const department = inferDepartment(agent);
        const priority   = inferPriority(taskTitle);
        const id         = generateTaskId(projectId, globalIndex++);

        const task = {
          id,
          projectId,
          title:         taskTitle,
          description:   `${phaseName} — ${taskTitle}`,
          department,
          assignedAgent: agent,
          priority,
          status:        STATUSES.CREATED,
          dependencies:  [],
          createdAt:     now,
          updatedAt:     now
        };

        const validation = validateTask(task);
        if (!validation.valid) {
          errors.push(`Task '${taskTitle}': ${validation.errors.join(", ")}`);
          continue;
        }

        created.push(task);
      }
    }

    // Merge with any existing tasks for this project
    const existing = storageAdapter.findByProject(projectId);
    storageAdapter.save(projectId, [...existing, ...created]);

    return {
      success: errors.length === 0,
      tasks:   created,
      errors
    };
  }


  /**
   * getTasks
   *
   * Returns all tasks for a given project.
   *
   * @param {string} projectId
   * @returns {object[]}
   */
  getTasks(projectId) {
    return storageAdapter.findByProject(projectId);
  }


  /**
   * assignTask
   *
   * Changes the assigned agent for a task.
   * Also updates department to match the new agent.
   *
   * @param {string} taskId
   * @param {string} agent
   * @returns {{ success, task, error }}
   */
  assignTask(taskId, agent) {

    if (!taskId) return { success: false, error: "taskId is required" };
    if (!agent)  return { success: false, error: "agent is required"  };

    const found = storageAdapter.findById(taskId);
    if (!found) return { success: false, error: `Task '${taskId}' not found` };

    const updated = {
      ...found.task,
      assignedAgent: agent,
      department:    inferDepartment(agent),
      updatedAt:     new Date().toISOString()
    };

    storageAdapter.upsert(updated.projectId, updated);

    return { success: true, task: updated };
  }


  /**
   * updateTaskStatus
   *
   * Transitions a task to a new lifecycle status.
   * Rejects invalid transitions.
   *
   * @param {string} taskId
   * @param {string} newStatus
   * @returns {{ success, task, error }}
   */
  updateTaskStatus(taskId, newStatus) {

    if (!taskId)    return { success: false, error: "taskId is required"   };
    if (!newStatus) return { success: false, error: "newStatus is required" };

    const found = storageAdapter.findById(taskId);
    if (!found) return { success: false, error: `Task '${taskId}' not found` };

    const { task } = found;

    if (!validateTransition(task.status, newStatus)) {
      return {
        success: false,
        error:   `Invalid transition: '${task.status}' → '${newStatus}'`
      };
    }

    const updated = {
      ...task,
      status:    newStatus,
      updatedAt: new Date().toISOString()
    };

    storageAdapter.upsert(updated.projectId, updated);

    return { success: true, task: updated };
  }

}


// ── Default singleton export ───────────────────────────────────────────────────

export const codingTaskManager = new CodingTaskManager();

export default codingTaskManager;