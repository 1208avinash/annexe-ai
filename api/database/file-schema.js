// ── ANNEXE AI — File Operation Database Schema ────────────────────────────────
//
// Future PostgreSQL schema definition for the File Operation Agent.
// No database connection — schema reference and migration guide only.
//
// ─────────────────────────────────────────────────────────────────────────────

export const FILE_SCHEMA = {

  // ── file_operations ───────────────────────────────────────────────────────
  //
  // Audit log for every file operation executed within a sandbox.
  // One record per operation attempt — success or failure.

  file_operations: {

    table: "file_operations",

    columns: {

      id: {
        type:        "VARCHAR(64)",
        primaryKey:  true,
        nullable:    false,
        description: "Unique audit entry ID, e.g. AUDIT-1720000000000-1"
      },

      sandbox_id: {
        type:        "VARCHAR(128)",
        nullable:    false,
        index:       true,
        foreignKey:  { table: "sandboxes", column: "id" },
        description: "Sandbox in which the operation ran"
      },

      agent: {
        type:        "VARCHAR(64)",
        nullable:    false,
        index:       true,
        description: "Agent that triggered the operation, e.g. frontend_coding_agent"
      },

      operation: {
        type:        "VARCHAR(16)",
        nullable:    false,
        description: "Operation type: CREATE | READ | UPDATE | DELETE | LIST"
      },

      file_path: {
        type:        "TEXT",
        nullable:    false,
        description: "Relative file path within the sandbox"
      },

      status: {
        type:        "VARCHAR(16)",
        nullable:    false,
        default:     "PENDING",
        description: "Outcome: PENDING | SUCCESS | FAILED | DENIED"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When the operation was recorded"
      }

    },

    indexes: [
      { columns: ["sandbox_id"],         unique: false },
      { columns: ["sandbox_id", "agent"], unique: false },
      { columns: ["operation"],           unique: false }
    ]

  },


  // ── file_versions ─────────────────────────────────────────────────────────
  //
  // Stores content snapshots for CREATE and UPDATE operations.
  // Enables diff, rollback, and change history per file.

  file_versions: {

    table: "file_versions",

    columns: {

      id: {
        type:        "SERIAL",
        primaryKey:  true,
        description: "Auto-increment surrogate key"
      },

      operation_id: {
        type:        "VARCHAR(64)",
        nullable:    false,
        index:       true,
        foreignKey:  { table: "file_operations", column: "id" },
        description: "The audit entry that produced this version snapshot"
      },

      file_path: {
        type:        "TEXT",
        nullable:    false,
        index:       true,
        description: "Relative file path — denormalised for fast lookups"
      },

      old_content: {
        type:        "TEXT",
        nullable:    true,
        description: "File content before the operation (null for CREATE)"
      },

      new_content: {
        type:        "TEXT",
        nullable:    true,
        description: "File content after the operation (null for DELETE)"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When this version snapshot was captured"
      }

    },

    indexes: [
      { columns: ["operation_id"], unique: false },
      { columns: ["file_path"],    unique: false }
    ]

  }

};
