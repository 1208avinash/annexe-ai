/*
  ANNEXE AI — Repository Manager
  FILE: api/database/repository-schema.js

  PostgreSQL Schema Definition
  Plain JavaScript object format.
  No database connection — schema reference only.
  Ready for future ORM or migration tooling integration.
*/


export const REPOSITORY_SCHEMA = {


  /*
    repository_actions

    Audit log of every repository action attempted
    by the ANNEXE AI pipeline.
  */

  repository_actions: {

    table: "repository_actions",

    columns: {

      id: {
        type:       "UUID",
        primaryKey: true,
        default:    "gen_random_uuid()",
        nullable:   false
      },

      project_id: {
        type:     "VARCHAR(128)",
        nullable: false,
        index:    true,
        comment:  "ANNEXE project identifier e.g. ANNEXE-1234567890"
      },

      repository: {
        type:     "VARCHAR(256)",
        nullable: true,
        comment:  "Target repository name or URL"
      },

      action: {
        type:     "VARCHAR(32)",
        nullable: false,
        comment:  "push | merge | create_branch | commit"
      },

      status: {
        type:     "VARCHAR(32)",
        nullable: false,
        comment:  "CREATED | PENDING | COMPLETED | REJECTED"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  },


  /*
    pull_requests

    Record of every pull request created by
    the ANNEXE AI pipeline.
  */

  pull_requests: {

    table: "pull_requests",

    columns: {

      id: {
        type:       "UUID",
        primaryKey: true,
        default:    "gen_random_uuid()",
        nullable:   false
      },

      project_id: {
        type:     "VARCHAR(128)",
        nullable: false,
        index:    true,
        comment:  "ANNEXE project identifier"
      },

      branch: {
        type:     "VARCHAR(256)",
        nullable: false,
        comment:  "Source branch e.g. annexe-ai/{projectId}/{taskId}"
      },

      title: {
        type:     "VARCHAR(512)",
        nullable: false,
        comment:  "Pull request title"
      },

      description: {
        type:     "TEXT",
        nullable: true,
        comment:  "Structured PR description including changes, tests, review"
      },

      status: {
        type:     "VARCHAR(32)",
        nullable: false,
        default:  "'PENDING_REVIEW'",
        comment:  "PENDING_REVIEW | APPROVED | MERGED | REJECTED"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  },


  /*
    commits

    Individual commits associated with a pull request.
  */

  commits: {

    table: "commits",

    columns: {

      id: {
        type:       "UUID",
        primaryKey: true,
        default:    "gen_random_uuid()",
        nullable:   false
      },

      pr_id: {
        type:     "UUID",
        nullable: true,
        index:    true,
        comment:  "Foreign key reference to pull_requests.id"
      },

      message: {
        type:     "VARCHAR(512)",
        nullable: false,
        comment:  "Conventional commit message e.g. feat(scope): description"
      },

      files_changed: {
        type:     "JSONB",
        nullable: false,
        default:  "'[]'",
        comment:  "Array of file names included in this commit"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  }

};

export default REPOSITORY_SCHEMA;