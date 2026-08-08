/*
  ANNEXE AI — Autonomous Orchestrator
  FILE: api/database/orchestrator-schema.js

  PostgreSQL Schema Definition
  Plain JavaScript object format.
  No database connection — schema reference only.
  Ready for future ORM or migration tooling integration.
*/


const ORCHESTRATOR_SCHEMA = {


  /*
    projects_state

    Tracks the current and previous lifecycle state
    for every ANNEXE AI project.
  */

  projects_state: {

    table: "projects_state",

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
        unique:   true,
        index:    true,
        comment:  "ANNEXE project identifier e.g. ANNEXE-1234567890"
      },

      current_state: {
        type:     "VARCHAR(32)",
        nullable: false,
        comment:  "CREATED | ANALYSIS | ARCHITECTURE_READY | TASKS_CREATED | CODING | TESTING | REVIEW | APPROVAL_REQUIRED | DELIVERED | FAILED"
      },

      previous_state: {
        type:     "VARCHAR(32)",
        nullable: true,
        comment:  "The state immediately before the current one"
      },

      updated_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  },


  /*
    agent_tasks

    Stores every task submitted to the orchestration queue.
  */

  agent_tasks: {

    table: "agent_tasks",

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

      agent: {
        type:     "VARCHAR(64)",
        nullable: false,
        comment:  "frontend_worker | backend_worker | database_worker | ai_worker | testing_worker | review_worker | repository_worker"
      },

      task_type: {
        type:     "VARCHAR(64)",
        nullable: false,
        comment:  "Type of work this task represents"
      },

      priority: {
        type:     "VARCHAR(16)",
        nullable: false,
        default:  "'MEDIUM'",
        comment:  "CRITICAL | HIGH | MEDIUM | LOW"
      },

      status: {
        type:     "VARCHAR(16)",
        nullable: false,
        default:  "'QUEUED'",
        comment:  "QUEUED | ASSIGNED | RUNNING | COMPLETED | FAILED"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  },


  /*
    agent_events

    Audit log of all events published through the EventBus.
  */

  agent_events: {

    table: "agent_events",

    columns: {

      id: {
        type:       "UUID",
        primaryKey: true,
        default:    "gen_random_uuid()",
        nullable:   false
      },

      project_id: {
        type:     "VARCHAR(128)",
        nullable: true,
        index:    true,
        comment:  "ANNEXE project identifier (nullable for system-level events)"
      },

      event_type: {
        type:     "VARCHAR(64)",
        nullable: false,
        comment:  "CODE_GENERATED | TEST_COMPLETED | REVIEW_COMPLETED | PR_CREATED | STATE_CHANGED | ..."
      },

      payload: {
        type:     "JSONB",
        nullable: false,
        default:  "'{}'",
        comment:  "Arbitrary event payload"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  },


  /*
    agent_runs

    Telemetry record for each agent execution run.
    Supports cost tracking, latency analysis, and debugging.
  */

  agent_runs: {

    table: "agent_runs",

    columns: {

      id: {
        type:       "UUID",
        primaryKey: true,
        default:    "gen_random_uuid()",
        nullable:   false
      },

      agent: {
        type:     "VARCHAR(64)",
        nullable: false,
        comment:  "The agent type that executed this run"
      },

      tokens: {
        type:     "INTEGER",
        nullable: true,
        comment:  "Total tokens consumed (if LLM-backed)"
      },

      duration: {
        type:     "INTEGER",
        nullable: true,
        comment:  "Execution duration in milliseconds"
      },

      status: {
        type:     "VARCHAR(16)",
        nullable: false,
        comment:  "COMPLETED | FAILED"
      },

      created_at: {
        type:     "TIMESTAMPTZ",
        nullable: false,
        default:  "NOW()"
      }

    }

  }

};


export default ORCHESTRATOR_SCHEMA;

export { ORCHESTRATOR_SCHEMA };
