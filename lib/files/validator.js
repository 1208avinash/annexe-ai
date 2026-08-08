// ── ANNEXE AI — File Request Validator ───────────────────────────────────────
//
// Validates incoming file operation requests before any execution occurs.
//
// ─────────────────────────────────────────────────────────────────────────────

import { FILE_OPERATIONS } from "./operations.js";


// ── Operations that require content ──────────────────────────────────────────

const CONTENT_REQUIRED = new Set([
  FILE_OPERATIONS.CREATE,
  FILE_OPERATIONS.UPDATE
]);

const VALID_OPERATIONS = new Set(Object.values(FILE_OPERATIONS));


// ── validateFileRequest ───────────────────────────────────────────────────────

/**
 * Validates a file operation request object.
 *
 * Required fields for all operations:
 *   sandboxId, agent, operation, filePath
 *
 * Additional requirement:
 *   content — required for CREATE and UPDATE
 *
 * @param {object} request
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFileRequest(request) {

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

  if (!request.agent) {
    errors.push("Missing required field: agent");
  }

  if (!request.operation) {
    errors.push("Missing required field: operation");
  } else if (!VALID_OPERATIONS.has(request.operation)) {
    errors.push(
      `Invalid operation "${request.operation}". Must be one of: ${[...VALID_OPERATIONS].join(", ")}`
    );
  }

  if (!request.filePath) {
    errors.push("Missing required field: filePath");
  }

  // ── Content requirement for CREATE / UPDATE ───────────────────────────────

  if (
    request.operation &&
    CONTENT_REQUIRED.has(request.operation) &&
    (request.content === undefined || request.content === null)
  ) {
    errors.push(
      `content is required for ${request.operation} operations`
    );
  }

  return {
    valid:  errors.length === 0,
    errors
  };

}
