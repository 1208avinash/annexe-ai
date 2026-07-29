// ── ANNEXE AI — Sandbox Permissions ──────────────────────────────────────────
//
// Permission engine for coding agents.
// Each agent is restricted to its own concern area within the sandbox.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Permission definitions ────────────────────────────────────────────────────

const AGENT_PERMISSIONS = {

  frontend_coding_agent: {
    allowed: [
      "src/",
      "components/",
      "pages/",
      "styles/"
    ],
    blocked: [
      ".env",
      "database/",
      "production/"
    ]
  },

  backend_coding_agent: {
    allowed: [
      "api/",
      "services/",
      "controllers/"
    ],
    blocked: [
      ".env",
      "frontend-secrets",
      "production/"
    ]
  },

  database_coding_agent: {
    allowed: [
      "database/",
      "migrations/",
      "models/"
    ],
    blocked: [
      ".env",
      "production/"
    ]
  },

  ai_coding_agent: {
    allowed: [
      "prompts/",
      "models/",
      "workflows/"
    ],
    blocked: [
      ".env",
      "security/",
      "production/"
    ]
  },

  // Safe defaults for any unrecognised agent
  general_coding_agent: {
    allowed: [
      "src/",
      "workspace/"
    ],
    blocked: [
      ".env",
      "database/",
      "security/",
      "production/",
      "frontend-secrets"
    ]
  }

};


// ── getAgentPermissions ───────────────────────────────────────────────────────

/**
 * Returns the permission set for the given agent.
 * Falls back to general_coding_agent defaults for unknown agents.
 *
 * @param {string} agentName
 * @returns {{ allowed: string[], blocked: string[] }}
 */
export function getAgentPermissions(agentName) {

  const permissions = AGENT_PERMISSIONS[agentName];

  if (!permissions) {
    console.warn(
      `SANDBOX PERMISSIONS: Unknown agent "${agentName}" — using general defaults`
    );
    return { ...AGENT_PERMISSIONS.general_coding_agent };
  }

  return { ...permissions };

}


// ── validateFileAccess ────────────────────────────────────────────────────────

/**
 * Checks whether an agent is allowed to access a given file path.
 *
 * Blocked paths are evaluated first (deny overrides allow).
 *
 * @param {string} agentName
 * @param {string} filePath
 * @returns {{ allowed: boolean, reason: string }}
 */
export function validateFileAccess(agentName, filePath) {

  if (!agentName || !filePath) {
    return {
      allowed: false,
      reason:  "agentName and filePath are required"
    };
  }

  const { allowed, blocked } = getAgentPermissions(agentName);

  // ── Check blocked paths first ─────────────────────────────────────────────

  for (const blockedPath of blocked) {
    if (filePath.includes(blockedPath)) {
      return {
        allowed: false,
        reason:  `Access denied: "${filePath}" matches blocked path "${blockedPath}"`
      };
    }
  }

  // ── Check allowed paths ───────────────────────────────────────────────────

  for (const allowedPath of allowed) {
    if (filePath.startsWith(allowedPath) || filePath.includes(allowedPath)) {
      return {
        allowed: true,
        reason:  `Access granted: "${filePath}" matches allowed path "${allowedPath}"`
      };
    }
  }

  // ── Neither matched — deny by default ────────────────────────────────────

  return {
    allowed: false,
    reason:  `Access denied: "${filePath}" is not in the allowed paths for ${agentName}`
  };

}
