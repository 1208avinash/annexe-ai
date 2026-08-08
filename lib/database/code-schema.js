// ── ANNEXE AI — Code Generation Database Schema ───────────────────────────────
//
// Future PostgreSQL schema for the Code Generation Agent layer.
// No database connection — schema reference and migration guide only.
//
// ─────────────────────────────────────────────────────────────────────────────

export const CODE_SCHEMA = {

  // ── code_generations ──────────────────────────────────────────────────────
  //
  // One record per generation run — tracks what the agent proposed.

  code_generations: {

    table: "code_generations",

    columns: {

      id: {
        type:        "VARCHAR(64)",
        primaryKey:  true,
        nullable:    false,
        description: "Unique generation ID, e.g. GEN-1720000000000-1"
      },

      task_id: {
        type:        "VARCHAR(128)",
        nullable:    false,
        index:       true,
        description: "Reference to the coding task that triggered generation"
      },

      agent: {
        type:        "VARCHAR(64)",
        nullable:    false,
        description: "Agent name, e.g. code_generation_agent"
      },

      language: {
        type:        "VARCHAR(32)",
        nullable:    true,
        description: "Primary language of the generated code"
      },

      files_generated: {
        type:        "INTEGER",
        nullable:    false,
        default:     0,
        description: "Number of file proposals produced in this run"
      },

      status: {
        type:        "VARCHAR(16)",
        nullable:    false,
        default:     "PENDING",
        description: "Outcome: PENDING | PROPOSED | ACCEPTED | REJECTED | FAILED"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When the generation run was recorded"
      }

    },

    indexes: [
      { columns: ["task_id"],  unique: false },
      { columns: ["agent"],    unique: false },
      { columns: ["status"],   unique: false }
    ]

  },


  // ── code_reviews ─────────────────────────────────────────────────────────
  //
  // One record per review of a generation output.
  // Populated by the Code Review Agent downstream.

  code_reviews: {

    table: "code_reviews",

    columns: {

      id: {
        type:        "VARCHAR(64)",
        primaryKey:  true,
        nullable:    false,
        description: "Unique review ID"
      },

      generation_id: {
        type:        "VARCHAR(64)",
        nullable:    false,
        index:       true,
        foreignKey:  { table: "code_generations", column: "id" },
        description: "The generation this review covers"
      },

      reviewer: {
        type:        "VARCHAR(64)",
        nullable:    false,
        description: "Reviewer identity, e.g. code_review_agent or human"
      },

      issues: {
        type:        "JSONB",
        nullable:    false,
        default:     "[]",
        description: "Array of issue objects: { severity, file, description }"
      },

      score: {
        type:        "SMALLINT",
        nullable:    true,
        description: "Quality score 0–100; null when review is pending"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When the review was recorded"
      }

    },

    indexes: [
      { columns: ["generation_id"], unique: false },
      { columns: ["reviewer"],      unique: false }
    ]

  },


  // ── agent_prompts ─────────────────────────────────────────────────────────
  //
  // Versioned prompt library for each coding agent.
  // Enables prompt iteration without code deploys.

  agent_prompts: {

    table: "agent_prompts",

    columns: {

      id: {
        type:        "SERIAL",
        primaryKey:  true,
        description: "Auto-increment surrogate key"
      },

      agent_name: {
        type:        "VARCHAR(64)",
        nullable:    false,
        index:       true,
        description: "Agent this prompt belongs to, e.g. code_generation_agent"
      },

      version: {
        type:        "VARCHAR(16)",
        nullable:    false,
        description: "Semantic version string, e.g. 1.0.0"
      },

      prompt: {
        type:        "TEXT",
        nullable:    false,
        description: "Full system prompt text sent to the LLM"
      },

      created_at: {
        type:        "TIMESTAMPTZ",
        nullable:    false,
        default:     "NOW()",
        description: "When this prompt version was recorded"
      }

    },

    indexes: [
      { columns: ["agent_name"],            unique: false },
      { columns: ["agent_name", "version"], unique: true  }
    ]

  }

};

export default CODE_SCHEMA;