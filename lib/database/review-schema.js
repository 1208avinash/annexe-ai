/*
  ANNEXE AI — Code Review Agent
  FILE: api/database/review-schema.js

  PostgreSQL Schema Definition
  Plain JavaScript object format.
  No database connection — schema reference only.
  Ready for future ORM or migration tooling integration.
*/


export const REVIEW_SCHEMA = {


  /*
    code_reviews

    Primary record for each completed code review.
  */

  code_reviews: {

    table: "code_reviews",

    columns: {

      id: {
        type:        "UUID",
        primaryKey:  true,
        default:     "gen_random_uuid()",
        nullable:    false
      },

      task_id: {
        type:     "VARCHAR(128)",
        nullable: true,
        index:    true,
        comment:  "Reference to the originating coding task"
      },

      score: {
        type:     "INTEGER",
        nullable: false,
        comment:  "Numeric review score from 0 to 100"
      },

      decision: {
        type:     "VARCHAR(32)",
        nullable: false,
        comment:  "APPROVED | APPROVED_WITH_CHANGES | REJECTED"
      },

      summary: {
        type:     "TEXT",
        nullable: true,
        comment:  "Human-readable review summary"
      },

      issues: {
        type:     "JSONB",
        nullable: false,
        default:  "'[]'",
        comment:  "Array of detected issues with severity and type"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  },


  /*
    review_rules

    Registry of all review rules used during analysis.
    Populated from rules.js on system initialisation.
  */

  review_rules: {

    table: "review_rules",

    columns: {

      id: {
        type:        "UUID",
        primaryKey:  true,
        default:     "gen_random_uuid()",
        nullable:    false
      },

      rule_id: {
        type:     "VARCHAR(16)",
        nullable: false,
        unique:   true,
        comment:  "Rule identifier e.g. SEC-001"
      },

      category: {
        type:     "VARCHAR(32)",
        nullable: false,
        comment:  "security | quality | architecture | testing"
      },

      severity: {
        type:     "VARCHAR(16)",
        nullable: false,
        comment:  "CRITICAL | HIGH | MEDIUM | LOW"
      },

      description: {
        type:     "TEXT",
        nullable: false,
        comment:  "Human-readable description of the rule"
      }

    }

  },


  /*
    review_history

    Audit trail linking reviews to projects
    and recording changes between review cycles.
  */

  review_history: {

    table: "review_history",

    columns: {

      id: {
        type:        "UUID",
        primaryKey:  true,
        default:     "gen_random_uuid()",
        nullable:    false
      },

      review_id: {
        type:     "UUID",
        nullable: false,
        index:    true,
        comment:  "Foreign key reference to code_reviews.id"
      },

      project_id: {
        type:     "VARCHAR(128)",
        nullable: true,
        index:    true,
        comment:  "ANNEXE project identifier e.g. ANNEXE-1234567890"
      },

      changes: {
        type:     "JSONB",
        nullable: true,
        default:  "'{}'",
        comment:  "Diff or changelog between review iterations"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  }

};

export default REVIEW_SCHEMA;