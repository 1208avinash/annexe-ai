// ── ANNEXE AI — Test Request Validator ───────────────────────────────────────
//
// Validates incoming test execution requests before the executor processes them.
//
// ─────────────────────────────────────────────────────────────────────────────

import { isCommandAllowed, TEST_COMMANDS } from "./commands.js";


// ── Known departments ─────────────────────────────────────────────────────────

const KNOWN_DEPARTMENTS = new Set(Object.keys(TEST_COMMANDS));


// ── validateTestRequest ───────────────────────────────────────────────────────

/**
 * Validates a test execution request object.
 *
 * Required fields:
 *   sandboxId, taskId, department, commands
 *
 * Also validates each command via the command registry.
 *
 * @param {object} request
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTestRequest(request) {

  const errors = [];

  if (!request || typeof request !== "object") {
    return {
      valid:  false,
      errors: ["request must be a non-null object"]
    };
  }

  // ── Required fields ───────────────────────────────────────────────────────

  if (!request.sandboxId) {
    errors.push("Missing required field: sandboxId");
  }

  if (!request.taskId) {
    errors.push("Missing required field: taskId");
  }

  if (!request.department) {
    errors.push("Missing required field: department");
  } else if (!KNOWN_DEPARTMENTS.has(request.department)) {
    errors.push(
      `Unknown department "${request.department}". Must be one of: ${[...KNOWN_DEPARTMENTS].join(", ")}`
    );
  }

  if (!request.commands) {
    errors.push("Missing required field: commands");
  } else if (!Array.isArray(request.commands)) {
    errors.push("commands must be an array");
  } else if (request.commands.length === 0) {
    errors.push("commands array must not be empty");
  }

  // ── Per-command validation (only when preceding checks passed) ────────────

  if (
    Array.isArray(request.commands) &&
    request.commands.length > 0 &&
    request.department &&
    KNOWN_DEPARTMENTS.has(request.department)
  ) {
    request.commands.forEach((cmd, idx) => {
      const { allowed, reason } = isCommandAllowed(cmd, request.department);
      if (!allowed) {
        errors.push(`commands[${idx}]: ${reason}`);
      }
    });
  }

  return {
    valid:  errors.length === 0,
    errors
  };

}
