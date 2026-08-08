// ── ANNEXE AI — Code Generation Validator ────────────────────────────────────
//
// Validates code generation proposals and file paths before hand-off to
// the File Operation Agent.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Allowed file actions ──────────────────────────────────────────────────────

const VALID_ACTIONS = new Set(["CREATE", "UPDATE", "DELETE"]);


// ── Blocked path patterns ─────────────────────────────────────────────────────

const BLOCKED_PATTERNS = [
  // Sensitive files
  { pattern: /\.env($|\.)/, label: ".env files" },
  { pattern: /\.env\.\w+/,  label: ".env variant files" },

  // Production directories
  { pattern: /(^|\/)production(\/|$)/i, label: "production/ directory" },
  { pattern: /(^|\/)prod(\/|$)/i,       label: "prod/ directory" },
  { pattern: /(^|\/)dist(\/|$)/i,       label: "dist/ directory" },
  { pattern: /(^|\/)\.vercel(\/|$)/,    label: ".vercel/ directory" },

  // Path traversal
  { pattern: /\.\.(\/|\\|$)/,           label: "path traversal (../)" },

  // Absolute paths
  { pattern: /^[/\\]/,                  label: "absolute Unix path" },
  { pattern: /^[a-zA-Z]:[/\\]/,         label: "absolute Windows path" },

  // Null bytes
  { pattern: /\0/,                      label: "null byte in path" }
];


// ── validateFilePath ──────────────────────────────────────────────────────────

/**
 * Validates a proposed file path against security and structural rules.
 *
 * @param {string} path
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateFilePath(path) {

  if (!path || typeof path !== "string") {
    return { valid: false, error: "path must be a non-empty string" };
  }

  for (const { pattern, label } of BLOCKED_PATTERNS) {
    if (pattern.test(path)) {
      return {
        valid: false,
        error: `Blocked path pattern (${label}): "${path}"`
      };
    }
  }

  // Must have a file extension
  if (!/\.\w+$/.test(path)) {
    return {
      valid: false,
      error: `Path must include a file extension: "${path}"`
    };
  }

  return { valid: true, error: null };

}


// ── validateGenerationProposal ────────────────────────────────────────────────

/**
 * Validates a full code generation proposal.
 *
 * Required at proposal level:
 *   - proposal.files  (non-empty array)
 *
 * Required per file entry:
 *   - action  (CREATE | UPDATE | DELETE)
 *   - path    (passes validateFilePath)
 *   - content (string; required for CREATE and UPDATE)
 *
 * @param {object} proposal
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateGenerationProposal(proposal) {

  const errors = [];

  if (!proposal || typeof proposal !== "object") {
    return { valid: false, errors: ["proposal must be a non-null object"] };
  }

  if (!Array.isArray(proposal.files) || proposal.files.length === 0) {
    errors.push("proposal.files must be a non-empty array");
    return { valid: false, errors };
  }

  proposal.files.forEach((file, idx) => {

    const prefix = `files[${idx}]`;

    if (!file || typeof file !== "object") {
      errors.push(`${prefix}: must be a non-null object`);
      return;
    }

    // action
    if (!file.action) {
      errors.push(`${prefix}: missing required field "action"`);
    } else if (!VALID_ACTIONS.has(file.action)) {
      errors.push(
        `${prefix}: invalid action "${file.action}". Must be one of: ${[...VALID_ACTIONS].join(", ")}`
      );
    }

    // path
    if (!file.path) {
      errors.push(`${prefix}: missing required field "path"`);
    } else {
      const { valid, error } = validateFilePath(file.path);
      if (!valid) {
        errors.push(`${prefix}: ${error}`);
      }
    }

    // content — required for CREATE and UPDATE
    const needsContent = file.action === "CREATE" || file.action === "UPDATE";

    if (needsContent && (file.content === undefined || file.content === null)) {
      errors.push(`${prefix}: "content" is required for ${file.action} operations`);
    }

  });

  return {
    valid:  errors.length === 0,
    errors
  };

}
