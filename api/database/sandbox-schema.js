// ── ANNEXE AI — Sandbox Database Schema ──────────────────────────────────────
//
// Future PostgreSQL schema definition.
// No database connection — schema reference only.
// Designed for adapter pattern: drop this into a migration runner when ready.
//
// ─────────────────────────────────────────────────────────────────────────────

export const SANDBOX_SCHEMA = {

  // ── sandboxes ─────────────────────────────────────────────────────────────
  //
  // One record per isolated workspace created for a project.

  sandboxes: {

    table: "sandboxes",

    columns: {

      id: {
        type:        "VARCHAR(128)",
        primaryKey:  true,
        nullable:    false,
        description: "Unique sandbox identifier, e.g. SANDBOX-project1-0001"
      },

      project_id: {
        type:        "VARCHAR(128)",
        nullable:    false,
        index:       true,
        description: "Reference to the ANNEXE project this sandbox belongs to"
      },

      path: {
        type:        "TEXT",
        nullable:    false,
        description: "Logical workspace path, e.g. sandbox/project1"
      },

      status: {
        type:        "VARCHAR(32)",
        nullable:    false,
        default:     "CREATED",
        description: "Lifecycle status: CREATED | INITIALIZING | READY | ACTIVE | TESTING | LOCKED | DESTROYED"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When the sandbox was created"
      },

      destroy_at: {
        type:        "TIMESTAMPTZ",
        nullable:    true,
        description: "When the sandbox was or should be destroyed"
      }

    },

    indexes: [
      { columns: ["project_id"], unique: false }
    ]

  },


  // ── sandbox_permissions ───────────────────────────────────────────────────
  //
  // Per-agent access rules recorded for a sandbox instance.
  // Provides an audit trail of what each agent was permitted to do.

  sandbox_permissions: {

    table: "sandbox_permissions",

    columns: {

      id: {
        type:        "SERIAL",
        primaryKey:  true,
        description: "Auto-increment surrogate key"
      },

      sandbox_id: {
        type:        "VARCHAR(128)",
        nullable:    false,
        foreignKey:  { table: "sandboxes", column: "id" },
        description: "Reference to the parent sandbox"
      },

      agent_name: {
        type:        "VARCHAR(64)",
        nullable:    false,
        description: "Name of the coding agent, e.g. frontend_coding_agent"
      },

      permission: {
        type:        "VARCHAR(16)",
        nullable:    false,
        description: "Permission type: READ | WRITE | EXECUTE"
      },

      allowed_paths: {
        type:        "JSONB",
        nullable:    false,
        default:     "[]",
        description: "Array of path prefixes the agent is permitted to access"
      },

      blocked_paths: {
        type:        "JSONB",
        nullable:    false,
        default:     "[]",
        description: "Array of path prefixes the agent is denied access to"
      }

    },

    indexes: [
      { columns: ["sandbox_id"], unique: false },
      { columns: ["sandbox_id", "agent_name"], unique: false }
    ]

  },


  // ── execution_sessions ────────────────────────────────────────────────────
  //
  // Records each command run by a coding agent within a sandbox.
  // Foundation for audit, replay, and debugging.

  execution_sessions: {

    table: "execution_sessions",

    columns: {

      id: {
        type:        "SERIAL",
        primaryKey:  true,
        description: "Auto-increment surrogate key"
      },

      sandbox_id: {
        type:        "VARCHAR(128)",
        nullable:    false,
        foreignKey:  { table: "sandboxes", column: "id" },
        description: "Sandbox in which the command ran"
      },

      agent: {
        type:        "VARCHAR(64)",
        nullable:    false,
        description: "Agent that triggered the execution"
      },

      command: {
        type:        "TEXT",
        nullable:    false,
        description: "The command or task string executed"
      },

      result: {
        type:        "TEXT",
        nullable:    true,
        description: "Stdout / return value of the execution"
      },

      status: {
        type:        "VARCHAR(16)",
        nullable:    false,
        default:     "PENDING",
        description: "Execution outcome: PENDING | RUNNING | SUCCESS | FAILED | TIMEOUT"
      },

      started_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When the execution started"
      },

      finished_at: {
        type:        "TIMESTAMPTZ",
        nullable:    true,
        description: "When the execution completed or failed"
      }

    },

    indexes: [
      { columns: ["sandbox_id"],         unique: false },
      { columns: ["sandbox_id", "agent"], unique: false }
    ]

  }

};
