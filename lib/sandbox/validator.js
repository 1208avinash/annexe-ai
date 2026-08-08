// ── ANNEXE AI — Sandbox Validator ────────────────────────────────────────────
//
// Validation utilities for sandbox objects.
//
// ─────────────────────────────────────────────────────────────────────────────

import { STATUSES } from "./lifecycle.js";


// ── Required fields ───────────────────────────────────────────────────────────

const REQUIRED_FIELDS = ["id", "projectId", "path", "status"];

const VALID_STATUSES = new Set(Object.values(STATUSES));


// ── validateSandbox ───────────────────────────────────────────────────────────

/**
 * Validates a sandbox object.
 *
 * @param {object} sandbox
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSandbox(sandbox) {

  const errors = [];

  if (!sandbox || typeof sandbox !== "object") {
    return {
      valid:  false,
      errors: ["sandbox must be a non-null object"]
    };
  }

  // ── Required field presence ───────────────────────────────────────────────

  for (const field of REQUIRED_FIELDS) {
    if (!sandbox[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // ── Status validity ───────────────────────────────────────────────────────

  if (sandbox.status && !VALID_STATUSES.has(sandbox.status)) {
    errors.push(
      `Invalid status "${sandbox.status}". Must be one of: ${[...VALID_STATUSES].join(", ")}`
    );
  }

  // ── Path format ───────────────────────────────────────────────────────────

  if (sandbox.path && typeof sandbox.path !== "string") {
    errors.push("path must be a string");
  }

  // ── ID format ─────────────────────────────────────────────────────────────

  if (sandbox.id && !sandbox.id.startsWith("SANDBOX-")) {
    errors.push(`id must start with "SANDBOX-", got: ${sandbox.id}`);
  }

  return {
    valid:  errors.length === 0,
    errors
  };

}
