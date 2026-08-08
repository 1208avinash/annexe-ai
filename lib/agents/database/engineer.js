import { createDatabaseEngineeringPlan } from "../../engineering/database/schema.js";

// ── Database type detection ───────────────────────────────────────────────────

const DATABASE_SIGNALS = {
  "postgres":    "PostgreSQL",
  "postgresql":  "PostgreSQL",
  "mysql":       "MySQL",
  "mongo":       "MongoDB",
  "mongodb":     "MongoDB",
  "sqlite":      "SQLite",
  "redis":       "Redis",
  "supabase":    "Supabase (PostgreSQL)",
  "planetscale": "PlanetScale (MySQL)"
};

function detectDatabaseType(technology = {}) {
  const raw  = technology.database || "";
  const norm = raw.toLowerCase().trim();
  for (const [signal, canonical] of Object.entries(DATABASE_SIGNALS)) {
    if (norm.includes(signal)) return canonical;
  }
  return raw || "PostgreSQL";
}


// ── Feature catalogues ────────────────────────────────────────────────────────

const FEATURE_ENTITIES = {
  authentication: ["users", "sessions", "password_reset_tokens"],
  crm:            ["customers", "contacts", "companies"],
  lead:           ["leads", "lead_scores", "lead_sources"],
  dashboard:      ["activity_logs", "audit_trail"],
  reporting:      ["reports", "report_snapshots"],
  notifications:  ["notifications", "notification_preferences"],
  chat:           ["conversations", "messages"],
  payments:       ["invoices", "payments", "billing_plans"],
  file:           ["files", "file_metadata"],
  api:            ["webhook_events", "api_keys"],
  ai:             ["ai_conversations", "agent_runs", "memory_snapshots"],
  automation:     ["workflows", "trigger_events", "workflow_runs"]
};

const FEATURE_RELATIONSHIPS = {
  authentication: ["users have many sessions", "users have many password_reset_tokens"],
  crm:            ["users have many customers", "customers have many contacts", "customers belong to companies"],
  lead:           ["customers have many leads", "leads have many lead_scores"],
  reporting:      ["users have many reports"],
  notifications:  ["users have many notifications", "users have one notification_preferences"],
  chat:           ["users have many conversations", "conversations have many messages"],
  payments:       ["users have many invoices", "invoices have many payments"],
  file:           ["users have many files"],
  ai:             ["users have many ai_conversations", "ai_conversations have many agent_runs"],
  automation:     ["workflows have many trigger_events", "trigger_events have many workflow_runs"]
};

const FEATURE_SCHEMA_TASKS = {
  authentication: ["Design users table with hashed password column", "Create sessions table with expiry tracking", "Add password_reset_tokens table with TTL"],
  crm:            ["Design customers and contacts schema with foreign keys", "Create companies table with relationship to customers"],
  lead:           ["Design leads table with status enum and scoring fields", "Create lead_sources lookup table"],
  reporting:      ["Design reports table with JSONB config column", "Create report_snapshots table for caching"],
  notifications:  ["Design notifications table with read status tracking", "Create notification_preferences table"],
  chat:           ["Design conversations table with participant tracking", "Create messages table with thread reference"],
  payments:       ["Design invoices table with line items JSONB", "Create payments table with gateway reference"],
  file:           ["Design files table with storage path and mime type columns"],
  api:            ["Design webhook_events log table with retry tracking", "Create api_keys table with scopes"],
  ai:             ["Design ai_conversations table with context window tracking", "Create agent_runs log table"],
  automation:     ["Design workflows table with trigger conditions JSONB", "Create workflow_runs audit table"]
};

const BASELINE_ENTITIES       = ["users", "audit_logs", "system_settings"];
const BASELINE_RELATIONSHIPS  = ["all entities reference users as owner or creator"];
const BASELINE_SCHEMA_TASKS   = [
  "Design full entity relationship diagram (ERD)",
  "Define primary keys, foreign keys, and constraints for all tables",
  "Agree naming conventions (snake_case, plural table names)",
  "Define enum types for status fields"
];


// ── Migration plan ────────────────────────────────────────────────────────────

function buildMigrationPlan(entities = []) {
  return [
    "Create initial migration with all base tables",
    "Version all schema changes through numbered migration files",
    "Write rollback (down) migration for every up migration",
    "Seed reference and lookup data in dedicated seed migration",
    `Verify migration runs cleanly on fresh database (${entities.length} entities)`,
    "Document migration execution order and dependencies"
  ];
}


// ── Indexing strategy ─────────────────────────────────────────────────────────

function buildIndexingStrategy(features = [], entities = []) {
  const indexes = [
    "Add primary key index on id column for all tables",
    "Add index on created_at for all tables (pagination and sorting)",
    "Add index on updated_at for change tracking queries"
  ];

  if (features.some(f => f.includes("auth"))) {
    indexes.push("Add unique index on users.email", "Add index on sessions.user_id and sessions.expires_at");
  }
  if (features.some(f => f.includes("crm"))) {
    indexes.push("Add index on customers.name and customers.email for search", "Add composite index on contacts (customer_id, created_at)");
  }
  if (features.some(f => f.includes("lead"))) {
    indexes.push("Add index on leads.status and leads.customer_id", "Add index on lead_scores.score for ranking queries");
  }
  if (features.some(f => f.includes("notif"))) {
    indexes.push("Add index on notifications.user_id and notifications.read_at");
  }
  if (features.some(f => f.includes("ai") || f.includes("automat"))) {
    indexes.push("Add index on agent_runs.status and agent_runs.project_id");
  }
  if (features.some(f => f.includes("pay"))) {
    indexes.push("Add index on invoices.user_id and invoices.status");
  }

  return indexes;
}


// ── Security plan ─────────────────────────────────────────────────────────────

function buildSecurityPlan(features = []) {
  const plan = [
    "Implement least-privilege database user roles (read, write, admin)",
    "Ensure all passwords are stored as bcrypt hashes — never plaintext",
    "Enable row-level security (RLS) for multi-tenant data isolation",
    "Encrypt sensitive columns at rest (PII, tokens, keys)",
    "Enforce SSL/TLS for all database connections",
    "Disable public database access — allow only application server IP",
    "Enable database audit logging for privileged operations"
  ];

  if (features.some(f => f.includes("pay"))) {
    plan.push("Mask payment card data — store only last 4 digits and token reference");
  }
  if (features.some(f => f.includes("file"))) {
    plan.push("Store file paths only — never store file binary data in database");
  }
  if (features.some(f => f.includes("ai"))) {
    plan.push("Restrict AI conversation memory table to owning user via RLS policy");
  }

  return plan;
}


// ── Optimization plan ─────────────────────────────────────────────────────────

function buildOptimizationPlan(features = []) {
  const plan = [
    "Configure connection pooling (PgBouncer or equivalent)",
    "Set appropriate connection pool size for expected concurrency",
    "Enable slow query logging with threshold of 100ms",
    "Review and optimise N+1 query patterns in ORM usage",
    "Schedule regular VACUUM and ANALYZE for PostgreSQL",
    "Establish query performance baseline with P95 targets"
  ];

  if (features.some(f => f.includes("report") || f.includes("dashboard"))) {
    plan.push("Create materialized views for heavy dashboard aggregation queries", "Schedule materialized view refresh jobs");
  }
  if (features.some(f => f.includes("ai") || f.includes("automat"))) {
    plan.push("Partition agent_runs table by created_at for large-volume logging");
  }
  if (features.some(f => f.includes("chat"))) {
    plan.push("Partition messages table by conversation_id for efficient thread retrieval");
  }

  return plan;
}


// ── Testing plan ──────────────────────────────────────────────────────────────

function buildTestingPlan(features = []) {
  const tests = [
    "Test all migrations run and roll back cleanly on fresh database",
    "Verify all foreign key constraints enforce referential integrity",
    "Test unique constraints reject duplicate values",
    "Verify seed data loads without errors",
    "Test connection pool behaviour under concurrent load",
    "Validate backup and restore procedure end-to-end"
  ];

  if (features.some(f => f.includes("auth"))) {
    tests.push("Test user creation, session storage, and token expiry");
  }
  if (features.some(f => f.includes("crm") || f.includes("lead"))) {
    tests.push("Test cascade delete behaviour for customer → leads → activities");
  }
  if (features.some(f => f.includes("pay"))) {
    tests.push("Test invoice and payment record integrity under concurrent writes");
  }

  return tests;
}


// ── Estimated tasks ───────────────────────────────────────────────────────────

function buildEstimatedTasks(entities, schemaTasks, migrationPlan, indexingStrategy, securityPlan, optimizationPlan, testingPlan) {
  const totalDays = Math.ceil(
    entities.length       * 0.5 +
    schemaTasks.length    * 1   +
    migrationPlan.length  * 0.5 +
    indexingStrategy.length * 0.25 +
    securityPlan.length   * 0.25 +
    testingPlan.length    * 0.5
  );

  return [
    { category: "Entities",           count: entities.length,          estimatedDaysEach: 0.5  },
    { category: "Schema Tasks",       count: schemaTasks.length,       estimatedDaysEach: 1    },
    { category: "Migration Steps",    count: migrationPlan.length,     estimatedDaysEach: 0.5  },
    { category: "Indexes",            count: indexingStrategy.length,  estimatedDaysEach: 0.25 },
    { category: "Security Tasks",     count: securityPlan.length,      estimatedDaysEach: 0.25 },
    { category: "Test Suites",        count: testingPlan.length,       estimatedDaysEach: 0.5  },
    { category: "Total estimated days", count: totalDays,              estimatedDaysEach: null }
  ];
}


// ── Feature matcher ───────────────────────────────────────────────────────────

function matchFeature(feature, signalMap) {
  const norm = feature.toLowerCase();
  for (const [signal, items] of Object.entries(signalMap)) {
    if (norm.includes(signal) || signal.includes(norm.split(" ")[0])) return items;
  }
  return [];
}

function buildFromFeatures(features) {
  const entities      = [...BASELINE_ENTITIES];
  const relationships = [...BASELINE_RELATIONSHIPS];
  const schemaTasks   = [...BASELINE_SCHEMA_TASKS];

  for (const feature of features) {
    matchFeature(feature, FEATURE_ENTITIES).forEach(e => {
      if (!entities.includes(e)) entities.push(e);
    });
    matchFeature(feature, FEATURE_RELATIONSHIPS).forEach(r => {
      if (!relationships.includes(r)) relationships.push(r);
    });
    matchFeature(feature, FEATURE_SCHEMA_TASKS).forEach(t => {
      if (!schemaTasks.includes(t)) schemaTasks.push(t);
    });
  }

  return { entities, relationships, schemaTasks };
}


// ── Main exported agent function ──────────────────────────────────────────────

export function runDatabaseEngineerAgent({
  project          = {},
  technology       = {},
  requirements     = {},
  engineeringTasks = []
} = {}) {

  const projectId    = project.projectId || null;
  const features     = requirements.features || [];
  const databaseType = detectDatabaseType(technology);

  const { entities, relationships, schemaTasks } = buildFromFeatures(features);

  const migrationPlan    = buildMigrationPlan(entities);
  const indexingStrategy = buildIndexingStrategy(features, entities);
  const securityPlan     = buildSecurityPlan(features);
  const optimizationPlan = buildOptimizationPlan(features);
  const testingPlan      = buildTestingPlan(features);
  const estimatedTasks   = buildEstimatedTasks(
    entities, schemaTasks, migrationPlan,
    indexingStrategy, securityPlan, optimizationPlan, testingPlan
  );

  const databasePlan = createDatabaseEngineeringPlan({
    projectId,
    databaseType,
    entities,
    relationships,
    schemaTasks,
    migrationPlan,
    indexingStrategy,
    securityPlan,
    optimizationPlan,
    testingPlan,
    estimatedTasks
  });

  const totalDays = estimatedTasks.find(t => t.category === "Total estimated days")?.count || 0;

  return {
    success: true,
    agent:   "database_engineer_agent",
    version: "1.0.0",
    databasePlan,
    _meta: {
      projectId,
      databaseType,
      featuresDetected:     features.length,
      entitiesCount:        entities.length,
      relationshipsCount:   relationships.length,
      schemaTasksCount:     schemaTasks.length,
      indexesCount:         indexingStrategy.length,
      securityTasksCount:   securityPlan.length,
      estimatedTotalDays:   totalDays,
      generatedAt:          new Date().toISOString()
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { project, technology, requirements, engineeringTasks } = req.body || {};
    if (!requirements) return res.status(400).json({ error: "requirements object required" });
    return res.status(200).json(runDatabaseEngineerAgent({ project, technology, requirements, engineeringTasks }));
  } catch (error) {
    console.error("DATABASE ENGINEER AGENT ERROR:", error);
    return res.status(500).json({ error: "Database engineering plan failed" });
  }
}