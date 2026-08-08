// ── ANNEXE AI — Test Command Registry ────────────────────────────────────────
//
// Safe command whitelist for the Test Execution Agent.
// No shell execution happens here — this is a policy layer only.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Allowed commands per department ──────────────────────────────────────────

export const TEST_COMMANDS = Object.freeze({

  frontend: [
    "npm test",
    "npm run build",
    "npm run lint"
  ],

  backend: [
    "pytest",
    "python -m pytest",
    "npm test"
  ],

  database: [
    "migration check",
    "schema validation"
  ],

  ai: [
    "workflow validation",
    "prompt validation"
  ]

});


// ── Blocked command patterns ──────────────────────────────────────────────────
//
// Any command matching one of these terms is denied regardless of department.

const BLOCKED_PATTERNS = [
  "rm",
  "delete",
  "sudo",
  "format",
  "production",
  "credentials"
];


// ── isCommandAllowed ──────────────────────────────────────────────────────────

/**
 * Checks whether a command is permitted for the given department.
 *
 * A command is allowed when:
 *   1. It does not match any blocked pattern.
 *   2. It appears in the department's whitelist (case-insensitive prefix match).
 *
 * @param {string} command
 * @param {string} department
 * @returns {{ allowed: boolean, reason: string }}
 */
export function isCommandAllowed(command, department) {

  if (!command || typeof command !== "string") {
    return {
      allowed: false,
      reason:  "command must be a non-empty string"
    };
  }

  const normalised = command.trim().toLowerCase();

  // ── Block list check (deny-first) ────────────────────────────────────────

  for (const pattern of BLOCKED_PATTERNS) {
    if (normalised.includes(pattern)) {
      return {
        allowed: false,
        reason:  `Command contains blocked term "${pattern}": "${command}"`
      };
    }
  }

  // ── Whitelist check ───────────────────────────────────────────────────────

  const allowed = TEST_COMMANDS[department] || [];

  const match = allowed.some(
    allowed => normalised.startsWith(allowed.toLowerCase())
  );

  if (!match) {
    return {
      allowed: false,
      reason:  `Command "${command}" is not in the allowed list for department "${department}"`
    };
  }

  return {
    allowed: true,
    reason:  `Command "${command}" is allowed for department "${department}"`
  };

}
