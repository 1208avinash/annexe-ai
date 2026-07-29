// ── ANNEXE AI — File Security ─────────────────────────────────────────────────
//
// Filesystem security utilities for the File Operation Agent.
// Prevents path traversal, absolute escapes, and unauthorised agent access.
//
// ─────────────────────────────────────────────────────────────────────────────

import { validateFileAccess } from "../sandbox/permissions.js";


// ── sanitizePath ──────────────────────────────────────────────────────────────

/**
 * Strips dangerous path segments from a file path.
 *
 * Rejects:
 *   - traversal sequences:  ../  ../../  ..\
 *   - absolute paths:       /etc/passwd   C:\Windows
 *   - null bytes:           %00
 *
 * @param {string} filePath
 * @returns {{ safe: boolean, sanitized: string | null, reason: string | null }}
 */
export function sanitizePath(filePath) {

  if (!filePath || typeof filePath !== "string") {
    return {
      safe:      false,
      sanitized: null,
      reason:    "filePath must be a non-empty string"
    };
  }

  // Null byte injection
  if (filePath.includes("\0")) {
    return {
      safe:      false,
      sanitized: null,
      reason:    "Null byte detected in path"
    };
  }

  // Absolute paths — Unix and Windows
  if (/^[/\\]/.test(filePath) || /^[a-zA-Z]:[/\\]/.test(filePath)) {
    return {
      safe:      false,
      sanitized: null,
      reason:    `Absolute path not allowed: "${filePath}"`
    };
  }

  // Path traversal sequences
  // Covers: ../ ..\\ ..%2f ..%5c and URL-encoded variants
  const traversalPattern = /(\.\.(\/|\\|%2f|%5c|%2F|%5C))|(\.\.$)/i;

  if (traversalPattern.test(filePath)) {
    return {
      safe:      false,
      sanitized: null,
      reason:    `Path traversal detected: "${filePath}"`
    };
  }

  // Normalise backslashes to forward slashes
  const sanitized = filePath.replace(/\\/g, "/");

  return {
    safe:      true,
    sanitized,
    reason:    null
  };

}


// ── validatePath ──────────────────────────────────────────────────────────────

/**
 * Validates a file path for safety and basic structural correctness.
 *
 * @param {string} filePath
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validatePath(filePath) {

  const { safe, reason } = sanitizePath(filePath);

  if (!safe) {
    return { valid: false, error: reason };
  }

  // Must contain at least one non-whitespace character after sanitisation
  if (!filePath.trim()) {
    return { valid: false, error: "filePath cannot be empty or whitespace" };
  }

  // Reject paths that are just dots
  if (/^\.+$/.test(filePath.trim())) {
    return { valid: false, error: `Invalid path: "${filePath}"` };
  }

  return { valid: true, error: null };

}


// ── validateAgentFileAccess ───────────────────────────────────────────────────

/**
 * Checks whether an agent is authorised to access the given file path.
 * Delegates to sandbox permission rules.
 *
 * @param {string} agentName
 * @param {string} filePath
 * @returns {{ allowed: boolean, reason: string }}
 */
export function validateAgentFileAccess(agentName, filePath) {

  if (!agentName) {
    return {
      allowed: false,
      reason:  "agentName is required"
    };
  }

  // Run path safety check first — no point consulting permissions for unsafe paths
  const { valid, error } = validatePath(filePath);

  if (!valid) {
    return {
      allowed: false,
      reason:  `Path validation failed: ${error}`
    };
  }

  // Delegate to sandbox permission engine
  return validateFileAccess(agentName, filePath);

}
