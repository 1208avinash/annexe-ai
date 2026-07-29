// ── ANNEXE AI — Task Validator ────────────────────────────────────────────────
//
// Validates coding task objects before they are persisted or executed.
// Returns a structured result so callers can surface errors precisely.
// ─────────────────────────────────────────────────────────────────────────────

import { STATUSES } from "./lifecycle.js";


// ── Required field definitions ────────────────────────────────────────────────

const REQUIRED_FIELDS = ["title", "projectId", "department", "assignedAgent", "status"];

const VALID_DEPARTMENTS = new Set(["frontend", "backend", "database", "ai", "general"]);

const VALID_AGENTS = new Set([
  "frontend_coding_agent",
  "backend_coding_agent",
  "database_coding_agent",
  "ai_coding_agent",
  "general_coding_agent"
]);

const VALID_STATUSES = new Set(Object.values(STATUSES));

const VALID_PRIORITIES = new Set(["high", "medium", "low"]);


/**
 * validateTask
 *
 * Validates a task object against required fields and allowed value sets.
 *
 * @param {object} task
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTask(task) {

  const errors = [];

  if (!task || typeof task !== "object") {
    return { valid: false, errors: ["task must be a non-null object"] };
  }

  // ── Required field presence ───────────────────────────────────────────────

  for (const field of REQUIRED_FIELDS) {
    if (!task[field] || String(task[field]).trim() === "") {
      errors.push(`'${field}' is required and must not be empty`);
    }
  }

  // ── Field value validation (only when field is present) ───────────────────

  if (task.department && !VALID_DEPARTMENTS.has(task.department)) {
    errors.push(`'department' must be one of: ${[...VALID_DEPARTMENTS].join(", ")} — got '${task.department}'`);
  }

  if (task.assignedAgent && !VALID_AGENTS.has(task.assignedAgent)) {
    errors.push(`'assignedAgent' must be one of: ${[...VALID_AGENTS].join(", ")} — got '${task.assignedAgent}'`);
  }

  if (task.status && !VALID_STATUSES.has(task.status)) {
    errors.push(`'status' must be one of: ${[...VALID_STATUSES].join(", ")} — got '${task.status}'`);
  }

  if (task.priority && !VALID_PRIORITIES.has(task.priority)) {
    errors.push(`'priority' must be one of: ${[...VALID_PRIORITIES].join(", ")} — got '${task.priority}'`);
  }

  if (task.dependencies !== undefined && !Array.isArray(task.dependencies)) {
    errors.push("'dependencies' must be an array");
  }

  // ── Title length guard ────────────────────────────────────────────────────

  if (task.title && task.title.length > 200) {
    errors.push("'title' must not exceed 200 characters");
  }

  return {
    valid:  errors.length === 0,
    errors
  };
}


/**
 * validateTaskUpdate
 *
 * Lighter validation for partial updates (assignTask, updateTaskStatus).
 * Only checks the fields being changed.
 *
 * @param {object} patch  - Partial task fields
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTaskUpdate(patch) {

  const errors = [];

  if (patch.assignedAgent !== undefined && !VALID_AGENTS.has(patch.assignedAgent)) {
    errors.push(`'assignedAgent' must be one of: ${[...VALID_AGENTS].join(", ")}`);
  }

  if (patch.status !== undefined && !VALID_STATUSES.has(patch.status)) {
    errors.push(`'status' must be one of: ${[...VALID_STATUSES].join(", ")}`);
  }

  if (patch.priority !== undefined && !VALID_PRIORITIES.has(patch.priority)) {
    errors.push(`'priority' must be one of: ${[...VALID_PRIORITIES].join(", ")}`);
  }

  return {
    valid:  errors.length === 0,
    errors
  };
}