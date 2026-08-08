// ── ANNEXE AI — Coding Task PostgreSQL Schema Definition ─────────────────────
//
// Future schema for PostgreSQL persistence layer.
// This file is documentation-as-code — no database connection, no SQL execution.
//
// When ready to implement:
//   1. Pass these definitions to your migration generator (Prisma, Knex, Alembic)
//   2. Replace the in-memory storageAdapter in api/tasks/manager.js
//      with a PostgreSQL adapter that uses these table/column names
//
// ─────────────────────────────────────────────────────────────────────────────

export const TASK_SCHEMA = {

  // ── coding_tasks ────────────────────────────────────────────────────────────
  //
  // One row per coding task created by the Coding Task Manager.

  coding_tasks: {
    table:   "coding_tasks",
    columns: {

      id: {
        type:        "UUID",
        primaryKey:  true,
        default:     "gen_random_uuid()",
        description: "Unique task identifier"
      },

      project_id: {
        type:        "VARCHAR(100)",
        nullable:    false,
        index:       true,
        description: "Parent project reference — foreign key to projects table"
      },

      parent_task_id: {
        type:        "UUID",
        nullable:    true,
        index:       true,
        description: "Self-referential FK for subtask hierarchy (null = top-level task)"
      },

      title: {
        type:        "VARCHAR(200)",
        nullable:    false,
        description: "Short human-readable task title"
      },

      description: {
        type:        "TEXT",
        nullable:    true,
        description: "Full task description including phase context"
      },

      department: {
        type:        "VARCHAR(50)",
        nullable:    false,
        enum:        ["frontend", "backend", "database", "ai", "general"],
        description: "Engineering department responsible for the task"
      },

      assigned_agent: {
        type:        "VARCHAR(100)",
        nullable:    false,
        enum:        ["frontend_coding_agent", "backend_coding_agent", "database_coding_agent", "ai_coding_agent", "general_coding_agent"],
        description: "AI agent assigned to execute the task"
      },

      priority: {
        type:        "VARCHAR(20)",
        nullable:    false,
        default:     "medium",
        enum:        ["high", "medium", "low"],
        description: "Execution priority"
      },

      status: {
        type:        "VARCHAR(20)",
        nullable:    false,
        default:     "CREATED",
        enum:        ["CREATED", "READY", "ASSIGNED", "CODING", "TESTING", "REVIEW", "APPROVED", "MERGED", "FAILED"],
        description: "Current lifecycle status"
      },

      dependencies: {
        type:        "JSONB",
        nullable:    false,
        default:     "[]",
        description: "Array of task IDs that must complete before this task can start"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "Task creation timestamp"
      },

      updated_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "Last update timestamp — updated on every status or assignment change"
      }

    },
    indexes: [
      { columns: ["project_id"],              name: "idx_coding_tasks_project_id"  },
      { columns: ["status"],                  name: "idx_coding_tasks_status"      },
      { columns: ["assigned_agent"],          name: "idx_coding_tasks_agent"       },
      { columns: ["project_id", "status"],    name: "idx_coding_tasks_project_status" }
    ]
  },


  // ── task_execution_logs ──────────────────────────────────────────────────────
  //
  // Append-only audit log — one row per agent action on a task.

  task_execution_logs: {
    table:   "task_execution_logs",
    columns: {

      id: {
        type:        "UUID",
        primaryKey:  true,
        default:     "gen_random_uuid()",
        description: "Log entry identifier"
      },

      task_id: {
        type:        "UUID",
        nullable:    false,
        index:       true,
        foreignKey:  { table: "coding_tasks", column: "id", onDelete: "CASCADE" },
        description: "Reference to the task being executed"
      },

      agent: {
        type:        "VARCHAR(100)",
        nullable:    false,
        description: "Agent name that produced this log entry"
      },

      action: {
        type:        "VARCHAR(100)",
        nullable:    false,
        description: "Action performed — e.g. 'status_update', 'code_generated', 'test_run'"
      },

      input: {
        type:        "JSONB",
        nullable:    true,
        description: "Serialised input passed to the agent for this action"
      },

      output: {
        type:        "JSONB",
        nullable:    true,
        description: "Serialised output produced by the agent"
      },

      timestamp: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When the action occurred"
      }

    },
    indexes: [
      { columns: ["task_id"],   name: "idx_exec_logs_task_id"  },
      { columns: ["agent"],     name: "idx_exec_logs_agent"    },
      { columns: ["timestamp"], name: "idx_exec_logs_timestamp" }
    ]
  },


  // ── agent_memory ─────────────────────────────────────────────────────────────
  //
  // Persistent memory store for AI coding agents across task executions.

  agent_memory: {
    table:   "agent_memory",
    columns: {

      id: {
        type:        "UUID",
        primaryKey:  true,
        default:     "gen_random_uuid()",
        description: "Memory record identifier"
      },

      project_id: {
        type:        "VARCHAR(100)",
        nullable:    false,
        index:       true,
        description: "Project this memory belongs to"
      },

      agent_name: {
        type:        "VARCHAR(100)",
        nullable:    false,
        index:       true,
        description: "Agent that owns this memory entry"
      },

      memory_type: {
        type:        "VARCHAR(50)",
        nullable:    false,
        enum:        ["context", "decision", "pattern", "error", "preference"],
        description: "Classification of memory content"
      },

      data: {
        type:        "JSONB",
        nullable:    false,
        description: "Serialised memory payload — structure varies by memory_type"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When this memory was recorded"
      }

    },
    indexes: [
      { columns: ["project_id", "agent_name"], name: "idx_agent_memory_project_agent" },
      { columns: ["memory_type"],              name: "idx_agent_memory_type"          }
    ]
  }

};

export default TASK_SCHEMA;