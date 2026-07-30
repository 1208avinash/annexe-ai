// ── ANNEXE AI — Command Execution Policy ─────────────────────────────────────
//
// Safety gatekeeper for the execution engine.
// Every command must pass through validateCommand() before execution.
//
// Responsibilities:
//   1. Reject empty or non-string commands
//   2. Match the command against the allowlist
//   3. Return a typed allow / block decision with a reason on block
//
// Does NOT:
//   - Execute commands
//   - Access the filesystem
//   - Call command-runner.js or runner.js
//   - Produce side effects of any kind
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Allowlist ─────────────────────────────────────────────────────────────────
//
// Each entry is either:
//   exact  — the full command string must match literally
//   prefix — the command must start with the given string
//             (used for commands that legitimately carry variable arguments,
//              e.g. `npm install <packages>` or `pip install -r <file>`)
//
// Deny overrides allow: if a command matches a prefix but also looks like it
// is escaping (e.g. shell operators), it is still rejected by the shell-
// injection guard that runs before the allowlist check.

const ALLOWLIST = [

  // ── Node / npm ──────────────────────────────────────────────────────────

  { type: "exact",  value: "node --version"          },
  { type: "exact",  value: "npm --version"           },
  { type: "prefix", value: "npm install"             },
  { type: "exact",  value: "npm run build"           },
  { type: "exact",  value: "npm test"                },

  // ── Python / pip ────────────────────────────────────────────────────────

  { type: "exact",  value: "python --version"        },
  { type: "exact",  value: "pip --version"           },
  { type: "exact",  value: "pip install -r requirements.txt" },
  { type: "exact",  value: "pytest"                  }

];


// ── Shell-injection patterns ──────────────────────────────────────────────────
//
// Rejected unconditionally, even when the base command would otherwise match.
// Covers: chaining (&&, ||, ;), piping (|), redirection (>, >>), subshells
// ($(...), `...`), background execution (&), variable expansion ($VAR).

const SHELL_INJECTION_RE = /[&|;><`$]/;


// ── validateCommand ───────────────────────────────────────────────────────────

/**
 * Validates a command string against the ANNEXE execution policy.
 *
 * @param {string} command
 * @returns {{ allowed: true,  command: string }
 *          |{ allowed: false, command: string, reason: string }}
 */
export function validateCommand(command) {

  // ── 1. Type and empty check ───────────────────────────────────────────────

  if (command === null || command === undefined) {
    return {
      allowed: false,
      command: String(command),
      reason:  "Command must be a string"
    };
  }

  if (typeof command !== "string") {
    return {
      allowed: false,
      command: String(command),
      reason:  "Command must be a string"
    };
  }

  const trimmed = command.trim();

  if (trimmed === "") {
    return {
      allowed: false,
      command: trimmed,
      reason:  "Command must not be empty"
    };
  }


  // ── 2. Shell-injection guard ──────────────────────────────────────────────

  if (SHELL_INJECTION_RE.test(trimmed)) {
    return {
      allowed: false,
      command: trimmed,
      reason:  "Command contains disallowed shell operator"
    };
  }


  // ── 3. Allowlist check ────────────────────────────────────────────────────

  for (const entry of ALLOWLIST) {

    if (entry.type === "exact" && trimmed === entry.value) {
      return { allowed: true, command: trimmed };
    }

    if (entry.type === "prefix" && trimmed === entry.value) {
      return { allowed: true, command: trimmed };
    }

    if (entry.type === "prefix" &&
        trimmed.startsWith(entry.value + " ")) {
      return { allowed: true, command: trimmed };
    }

  }


  // ── 4. Default deny ───────────────────────────────────────────────────────

  return {
    allowed: false,
    command: trimmed,
    reason:  `Command not permitted by execution policy: "${trimmed}"`
  };

}


export default validateCommand;
