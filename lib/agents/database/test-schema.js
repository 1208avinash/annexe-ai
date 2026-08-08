// ── ANNEXE AI — Test Execution Database Schema ───────────────────────────────
//
// Future PostgreSQL schema for the Test Execution Agent.
// No database connection — schema reference and migration guide only.
//
// ─────────────────────────────────────────────────────────────────────────────

export const TEST_SCHEMA = {

  // ── test_executions ───────────────────────────────────────────────────────
  //
  // One record per runTests() call — tracks what was run and the overall outcome.

  test_executions: {

    table: "test_executions",

    columns: {

      id: {
        type:        "VARCHAR(64)",
        primaryKey:  true,
        nullable:    false,
        description: "Unique execution ID, e.g. EXEC-1720000000000-1"
      },

      sandbox_id: {
        type:        "VARCHAR(128)",
        nullable:    false,
        index:       true,
        foreignKey:  { table: "sandboxes", column: "id" },
        description: "Sandbox in which the tests ran"
      },

      task_id: {
        type:        "VARCHAR(128)",
        nullable:    false,
        index:       true,
        description: "Coding task that triggered this test run"
      },

      agent: {
        type:        "VARCHAR(64)",
        nullable:    false,
        description: "Agent name, e.g. test_execution_agent"
      },

      command: {
        type:        "TEXT",
        nullable:    false,
        description: "Serialised list of commands that were executed (JSON array)"
      },

      status: {
        type:        "VARCHAR(16)",
        nullable:    false,
        default:     "PENDING",
        description: "Overall outcome: PENDING | PASSED | FAILED | DENIED | INVALID"
      },

      output: {
        type:        "TEXT",
        nullable:    true,
        description: "Aggregated stdout/stderr from all commands"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When the execution record was created"
      }

    },

    indexes: [
      { columns: ["sandbox_id"],          unique: false },
      { columns: ["task_id"],             unique: false },
      { columns: ["status"],              unique: false }
    ]

  },


  // ── test_results ──────────────────────────────────────────────────────────
  //
  // One record per individual command within an execution run.

  test_results: {

    table: "test_results",

    columns: {

      id: {
        type:        "SERIAL",
        primaryKey:  true,
        description: "Auto-increment surrogate key"
      },

      execution_id: {
        type:        "VARCHAR(64)",
        nullable:    false,
        index:       true,
        foreignKey:  { table: "test_executions", column: "id" },
        description: "Parent execution this result belongs to"
      },

      test_name: {
        type:        "TEXT",
        nullable:    false,
        description: "The command or test suite name that was run"
      },

      passed: {
        type:        "BOOLEAN",
        nullable:    false,
        default:     false,
        description: "Whether this individual command/test passed"
      },

      errors: {
        type:        "JSONB",
        nullable:    false,
        default:     "[]",
        description: "Array of classified issue objects from the analyzer"
      },

      duration: {
        type:        "VARCHAR(16)",
        nullable:    true,
        description: "Simulated or measured execution duration, e.g. '8s'"
      }

    },

    indexes: [
      { columns: ["execution_id"], unique: false },
      { columns: ["passed"],       unique: false }
    ]

  },


  // ── test_commands ─────────────────────────────────────────────────────────
  //
  // Persistent registry of allowed commands per language/framework.
  // Seeds from TEST_COMMANDS; allows runtime updates without a code deploy.

  test_commands: {

    table: "test_commands",

    columns: {

      id: {
        type:        "SERIAL",
        primaryKey:  true,
        description: "Auto-increment surrogate key"
      },

      language: {
        type:        "VARCHAR(32)",
        nullable:    false,
        index:       true,
        description: "Target language or department, e.g. frontend, backend"
      },

      framework: {
        type:        "VARCHAR(64)",
        nullable:    true,
        description: "Testing framework this command belongs to, e.g. Jest, pytest"
      },

      command: {
        type:        "TEXT",
        nullable:    false,
        description: "The exact command string, e.g. npm test"
      },

      allowed: {
        type:        "BOOLEAN",
        nullable:    false,
        default:     true,
        description: "Whether this command is currently permitted for execution"
      }

    },

    indexes: [
      { columns: ["language"],            unique: false },
      { columns: ["language", "command"], unique: true  }
    ]

  }

};

export default TEST_SCHEMA;
