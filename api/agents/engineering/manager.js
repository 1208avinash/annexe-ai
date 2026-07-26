import { createEngineeringPlan } from "../../engineering/schema.js";

const BASE_TASKS = {
  frontend: [
    { title: "Setup frontend project scaffold",  description: "Initialise Next.js project, configure TypeScript, Tailwind, and folder structure",         priority: "high",   estimatedDays: 1 },
    { title: "Build authentication UI",          description: "Login, register, forgot-password screens with form validation",                             priority: "high",   estimatedDays: 2 },
    { title: "Create main dashboard",            description: "Overview page with KPI cards, navigation, and responsive layout",                           priority: "high",   estimatedDays: 3 },
    { title: "Build CRM and contacts views",     description: "Contact list, detail view, pipeline board",                                                 priority: "medium", estimatedDays: 3 },
    { title: "Build reporting views",            description: "Charts, export controls, date-range filters",                                               priority: "medium", estimatedDays: 2 },
    { title: "Implement notifications UI",       description: "In-app notification centre and alert banners",                                              priority: "low",    estimatedDays: 1 },
    { title: "Chat and messaging interface",     description: "Conversation thread component, input box, history scroll",                                  priority: "low",    estimatedDays: 2 },
    { title: "Client portal",                    description: "Client-facing portal with read-only project views",                                         priority: "low",    estimatedDays: 2 },
    { title: "Responsive QA pass",               description: "Mobile and tablet audit, accessibility review",                                             priority: "medium", estimatedDays: 1 }
  ],
  backend: [
    { title: "Setup backend project scaffold",   description: "Initialise FastAPI project, configure environments, folder structure, and health endpoint", priority: "high",   estimatedDays: 1 },
    { title: "Design and implement API gateway", description: "Route definitions, middleware, CORS, and versioning",                                       priority: "high",   estimatedDays: 2 },
    { title: "Implement authentication layer",   description: "JWT issuance, refresh tokens, role-based access control",                                  priority: "high",   estimatedDays: 2 },
    { title: "Build core business logic",        description: "Domain services for the primary business object (lead, order, ticket, etc.)",               priority: "high",   estimatedDays: 3 },
    { title: "Create integration connectors",    description: "Webhook handlers, outbound API clients, event bus wiring",                                 priority: "medium", estimatedDays: 2 },
    { title: "Build notification service",       description: "Email and SMS dispatch, template engine, queue integration",                               priority: "medium", estimatedDays: 2 },
    { title: "Implement file handling service",  description: "Upload endpoint, virus scan hook, storage adapter",                                        priority: "low",    estimatedDays: 1 },
    { title: "Payment integration",              description: "Payment gateway adapter, webhook receiver, invoice generation",                             priority: "medium", estimatedDays: 2 },
    { title: "API documentation",                description: "Auto-generate OpenAPI spec, add usage examples",                                           priority: "low",    estimatedDays: 1 }
  ],
  database: [
    { title: "Design full database schema",      description: "ERD, table definitions, relationships, indexes, and constraints",                           priority: "high",   estimatedDays: 2 },
    { title: "Write initial migrations",         description: "Migration files for all base tables",                                                       priority: "high",   estimatedDays: 1 },
    { title: "Seed reference data",              description: "Insert lookup tables, default roles, and test fixtures",                                    priority: "medium", estimatedDays: 1 },
    { title: "Configure connection pooling",     description: "Pool settings for production load",                                                         priority: "medium", estimatedDays: 1 },
    { title: "Backup and recovery plan",         description: "Configure automated daily backups, test restore procedure",                                 priority: "low",    estimatedDays: 1 }
  ],
  ai: [
    { title: "Configure LLM API connection",     description: "Set up API client, key management, retry logic, and rate-limit handling",                  priority: "high",   estimatedDays: 1 },
    { title: "Build agent orchestration layer",  description: "Agent runner, prompt routing, response parsing, tool-call handling",                       priority: "high",   estimatedDays: 3 },
    { title: "Implement memory and context",     description: "Conversation history storage, summarisation, sliding-window truncation",                   priority: "high",   estimatedDays: 2 },
    { title: "Build knowledge base",             description: "Document ingestion, vector embedding, similarity search",                                  priority: "medium", estimatedDays: 2 },
    { title: "Create AI workflows",              description: "Trigger to AI decision to system action chains for each use case",                         priority: "high",   estimatedDays: 3 },
    { title: "AI quality evaluation",            description: "Prompt regression tests, output scoring, hallucination detection baseline",                priority: "medium", estimatedDays: 2 }
  ],
  devops: [
    { title: "Initialise version control",       description: "Create repo, branch strategy, .gitignore",                                                priority: "high",   estimatedDays: 1 },
    { title: "Configure CI/CD pipeline",         description: "Lint, test, build, deploy per environment",                                               priority: "high",   estimatedDays: 2 },
    { title: "Setup environment matrix",         description: "Development, staging, and production configs and secrets management",                      priority: "high",   estimatedDays: 1 },
    { title: "Infrastructure provisioning",      description: "Cloud resources: compute, managed database, storage, CDN, DNS",                           priority: "high",   estimatedDays: 2 },
    { title: "Monitoring and alerting",          description: "Error tracking, uptime checks, performance dashboards",                                    priority: "medium", estimatedDays: 1 },
    { title: "Security hardening",               description: "HTTPS enforcement, secrets rotation, dependency audit, OWASP checklist",                  priority: "medium", estimatedDays: 1 },
    { title: "Load testing baseline",            description: "Script for primary endpoints, document P95 targets",                                       priority: "low",    estimatedDays: 1 }
  ]
};

const FEATURE_TASK_SIGNALS = {
  authentication: { frontend: ["authentication"],      backend: ["authentication"]             },
  dashboard:      { frontend: ["dashboard"]                                                     },
  crm:            { frontend: ["crm", "contact"],      backend: ["business logic"]             },
  reporting:      { frontend: ["reporting"]                                                     },
  notifications:  { frontend: ["notification"],        backend: ["notification"]               },
  chat:           { frontend: ["chat", "messaging"]                                             },
  payments:       { backend:  ["payment"]                                                       },
  file:           { backend:  ["file"]                                                          },
  api:            { backend:  ["integration", "api", "gateway"]                                },
  ai:             { ai:       ["llm", "agent", "memory", "knowledge", "workflow", "evaluation"] },
  automation:     { ai:       ["workflow", "agent"]                                             }
};

function assignTaskIds(tasks, prefix) {
  return tasks.map((t, i) => ({
    taskId: `${prefix}-${String(i + 1).padStart(3, "0")}`,
    ...t,
    dependencies: []
  }));
}

function selectTasks(teamKey, features = []) {
  const all = BASE_TASKS[teamKey] || [];
  if (teamKey === "devops" || teamKey === "database") return all;
  const activeKeywords = new Set();
  for (const feature of features) {
    const norm = feature.toLowerCase();
    for (const [signal, teamMap] of Object.entries(FEATURE_TASK_SIGNALS)) {
      if (norm.includes(signal) || signal.includes(norm.split(" ")[0])) {
        (teamMap[teamKey] || []).forEach(k => activeKeywords.add(k));
      }
    }
  }
  return all.filter(t => {
    if (t.priority === "high") return true;
    const titleLower = t.title.toLowerCase();
    return [...activeKeywords].some(kw => titleLower.includes(kw));
  });
}

function buildDependencies() {
  return [
    { from: "database", to: "backend",  reason: "Backend services require schema and migrations to exist"      },
    { from: "backend",  to: "frontend", reason: "Frontend consumes API contracts defined by backend"            },
    { from: "backend",  to: "ai",       reason: "AI workflows call backend business logic endpoints"            },
    { from: "devops",   to: "backend",  reason: "CI/CD and environment setup must precede backend deployment"  },
    { from: "devops",   to: "frontend", reason: "Frontend deployment pipeline depends on DevOps configuration" }
  ];
}

function buildDevelopmentOrder(hasAI) {
  const order = ["database_foundation", "backend_core", "frontend_application"];
  if (hasAI) order.push("ai_integration");
  order.push("testing", "deployment");
  return order;
}

function buildRisks(hasAI) {
  const risks = [
    { area: "scope",       risk: "Requirement changes after architecture approval",          mitigation: "Lock scope at architecture sign-off; log changes through change control"                             },
    { area: "integration", risk: "Third-party API credentials delayed by client",            mitigation: "Identify all external dependencies in week 1; request access immediately"                           },
    { area: "timeline",    risk: "Delayed client feedback at milestone gates",               mitigation: "Set 48-hour feedback SLA per milestone; proceed with best judgement if exceeded"                    },
    { area: "security",    risk: "Authentication misconfiguration in early build",           mitigation: "Run OWASP basic checklist after auth layer delivery; pen-test before launch"                       }
  ];
  if (hasAI) {
    risks.push({ area: "ai_quality", risk: "LLM output inconsistency or hallucination in production", mitigation: "Implement output validation, fallback logic, and regression test suite for AI workflows" });
  }
  return risks;
}

export function runEngineeringManagerAgent({
  project      = {},
  architecture = {},
  technology   = {},
  requirements = {}
} = {}) {

  const projectId   = project.projectId  || null;
  const projectName = project.solution   || project.projectName || "ANNEXE Project";
  const features    = requirements.features || [];

  const hasAI = features.some(f =>
    f.toLowerCase().includes("ai") ||
    f.toLowerCase().includes("agent") ||
    f.toLowerCase().includes("automat") ||
    f.toLowerCase().includes("intelligence")
  ) || !!architecture.aiArchitecture;

  const teams = {
    frontend: assignTaskIds(selectTasks("frontend", features), "FE"),
    backend:  assignTaskIds(selectTasks("backend",  features), "BE"),
    database: assignTaskIds(selectTasks("database", features), "DB"),
    ai:       hasAI ? assignTaskIds(selectTasks("ai", features), "AI") : [],
    devops:   assignTaskIds(selectTasks("devops",   features), "DO")
  };

  const engineeringPlan = createEngineeringPlan({
    projectId,
    projectName,
    status: "ready",
    teams,
    developmentOrder: buildDevelopmentOrder(hasAI),
    dependencies:     buildDependencies(),
    risks:            buildRisks(hasAI)
  });

  const totalTasks = Object.values(teams).reduce((sum, t) => sum + t.length, 0);
  const totalDays  = Object.values(teams).reduce((sum, tl) => sum + tl.reduce((s, t) => s + (t.estimatedDays || 0), 0), 0);

  return {
    success: true,
    agent:   "engineering_manager_agent",
    version: "1.0.0",
    engineeringPlan,
    _meta: {
      projectId,
      featuresDetected: features.length,
      hasAI,
      totalTasks,
      totalDays,
      teamsActive:  Object.entries(teams).filter(([, t]) => t.length > 0).map(([k]) => k),
      generatedAt:  new Date().toISOString()
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { project, architecture, technology, requirements } = req.body || {};
    if (!project && !requirements) return res.status(400).json({ error: "project or requirements object required" });
    return res.status(200).json(runEngineeringManagerAgent({ project, architecture, technology, requirements }));
  } catch (error) {
    console.error("ENGINEERING MANAGER AGENT ERROR:", error);
    return res.status(500).json({ error: "Engineering plan generation failed" });
  }
}