import { createBackendEngineeringPlan } from "../../engineering/backend/schema.js";

// ── Framework detection ───────────────────────────────────────────────────────

const FRAMEWORK_SIGNALS = {
  "fastapi":  "FastAPI",
  "django":   "Django",
  "flask":    "Flask",
  "express":  "Express",
  "node":     "Node.js",
  "nest":     "NestJS",
  "nestjs":   "NestJS",
  "spring":   "Spring Boot",
  "laravel":  "Laravel",
  "rails":    "Ruby on Rails",
  "hono":     "Hono"
};

function detectFramework(technology = {}) {
  const raw  = technology.backend || "";
  const norm = raw.toLowerCase().trim();
  for (const [signal, canonical] of Object.entries(FRAMEWORK_SIGNALS)) {
    if (norm.includes(signal)) return canonical;
  }
  return raw || "FastAPI";
}


// ── Feature catalogues ────────────────────────────────────────────────────────

const FEATURE_SERVICES = {
  authentication: ["User service", "Auth token service", "Session management service"],
  crm:            ["CRM service", "Contact management service"],
  lead:           ["Lead management service", "Lead scoring service"],
  dashboard:      ["Dashboard aggregation service", "Analytics service"],
  reporting:      ["Reporting service", "Export service"],
  notifications:  ["Notification service", "Email dispatch service"],
  chat:           ["Messaging service", "Conversation history service"],
  payments:       ["Payment service", "Invoice service", "Billing service"],
  file:           ["File handling service", "Storage adapter service"],
  api:            ["Integration service", "Webhook handler service"],
  ai:             ["AI integration service", "Agent orchestration service", "Memory management service"],
  automation:     ["Workflow automation service", "Trigger engine service"]
};

const FEATURE_APIS = {
  authentication: ["Authentication API (login, register, refresh, logout)", "Password reset API"],
  crm:            ["Customer API (CRUD)", "Contact API"],
  lead:           ["Lead API (CRUD)", "Lead assignment API"],
  dashboard:      ["Dashboard summary API", "KPI metrics API"],
  reporting:      ["Reports API", "Export API (CSV, PDF)"],
  notifications:  ["Notifications API", "Notification preferences API"],
  chat:           ["Messaging API", "Conversation history API"],
  payments:       ["Payments API", "Invoice API", "Billing API"],
  file:           ["File upload API", "File management API"],
  api:            ["Webhook API", "External integration API"],
  ai:             ["AI inference API", "AI workflow trigger API"],
  automation:     ["Automation trigger API", "Workflow status API"]
};

const FEATURE_DATABASE = {
  authentication: ["Create users table and migrations", "Add session/token storage model"],
  crm:            ["Create customers and contacts schema", "Add CRM pipeline tables"],
  lead:           ["Create leads table with scoring fields"],
  dashboard:      ["Create aggregation views for dashboard queries"],
  reporting:      ["Create reporting materialized views", "Add query indexes for analytics"],
  notifications:  ["Create notifications table and delivery log"],
  chat:           ["Create conversations and messages schema"],
  payments:       ["Create invoices and payments tables"],
  file:           ["Create file metadata table"],
  api:            ["Create webhook events log table"],
  ai:             ["Create AI conversation memory table", "Create agent run log table"],
  automation:     ["Create workflow definitions table", "Create trigger events log"]
};

const BASELINE_SERVICES  = ["Health check service", "Logging service", "Error handling service"];
const BASELINE_APIS      = ["Health check endpoint (GET /health)", "API versioning layer (v1)"];
const BASELINE_DATABASE  = [
  "Design full database schema and ERD",
  "Write initial migrations for all base tables",
  "Configure connection pooling",
  "Seed reference and lookup data"
];


// ── Authentication tasks ──────────────────────────────────────────────────────

function buildAuthentication(features = []) {
  const tasks = [];
  const hasAuth = features.some(f => f.includes("auth"));

  if (hasAuth) {
    tasks.push(
      "Implement JWT access and refresh token issuance",
      "Build token validation middleware",
      "Implement role-based access control (RBAC)",
      "Add token blacklist for logout",
      "Implement password hashing with bcrypt"
    );
  } else {
    tasks.push(
      "Authentication review required — no auth feature detected",
      "Implement API key authentication as minimum baseline"
    );
  }

  if (features.some(f => f.includes("oauth") || f.includes("google") || f.includes("social"))) {
    tasks.push("Implement OAuth2 social login provider");
  }

  return tasks;
}


// ── Integrations ──────────────────────────────────────────────────────────────

function buildIntegrations(features = []) {
  const items = ["Configure CORS for frontend domain", "Setup environment variable management"];

  if (features.some(f => f.includes("notif") || f.includes("email"))) {
    items.push("Integrate email dispatch service (SMTP / SendGrid)");
  }
  if (features.some(f => f.includes("pay"))) {
    items.push("Integrate payment gateway (Stripe / provider)");
  }
  if (features.some(f => f.includes("file") || f.includes("upload"))) {
    items.push("Integrate cloud storage adapter (S3 / equivalent)");
  }
  if (features.some(f => f.includes("ai") || f.includes("automat"))) {
    items.push("Integrate LLM API client with retry and rate-limit handling");
  }
  if (features.some(f => f.includes("api") || f.includes("webhook"))) {
    items.push("Build outbound webhook dispatcher", "Implement integration event bus");
  }

  return items;
}


// ── Security tasks ────────────────────────────────────────────────────────────

function buildSecurityTasks(features = []) {
  const tasks = [
    "Implement request input validation and sanitisation",
    "Add rate limiting to all public endpoints",
    "Enforce HTTPS and secure headers (Helmet equivalent)",
    "Implement permission checks on all protected routes",
    "Setup secrets management via environment variables",
    "Add SQL injection prevention (parameterised queries / ORM)",
    "Configure dependency vulnerability scanning"
  ];

  if (features.some(f => f.includes("pay"))) {
    tasks.push("PCI compliance review for payment endpoints");
  }
  if (features.some(f => f.includes("file") || f.includes("upload"))) {
    tasks.push("Implement file type validation and virus scan hook on upload");
  }
  if (features.some(f => f.includes("ai"))) {
    tasks.push("Implement prompt injection defence for AI endpoints");
  }

  return tasks;
}


// ── Testing plan ──────────────────────────────────────────────────────────────

function buildTestingPlan(features = []) {
  const tests = [
    "Unit tests for all service layer functions",
    "Integration tests for all API endpoints",
    "Authentication and authorisation tests",
    "Database query and migration tests",
    "Error handling and edge case tests",
    "Performance baseline test (P95 response times)"
  ];

  if (features.some(f => f.includes("pay"))) {
    tests.push("Payment flow end-to-end test with sandbox credentials");
  }
  if (features.some(f => f.includes("ai") || f.includes("automat"))) {
    tests.push("AI agent integration test with mock LLM responses");
  }
  if (features.some(f => f.includes("webhook") || f.includes("api"))) {
    tests.push("Webhook delivery and retry logic tests");
  }

  return tests;
}


// ── Estimated tasks ───────────────────────────────────────────────────────────

function buildEstimatedTasks(services, apis, dbTasks, securityTasks, testingPlan) {
  const totalDays = Math.ceil(
    services.length     * 1   +
    apis.length         * 0.5 +
    dbTasks.length      * 1   +
    securityTasks.length * 0.5 +
    testingPlan.length  * 0.5
  );

  return [
    { category: "Services",       count: services.length,      estimatedDaysEach: 1   },
    { category: "APIs",           count: apis.length,          estimatedDaysEach: 0.5 },
    { category: "Database Tasks", count: dbTasks.length,       estimatedDaysEach: 1   },
    { category: "Security Tasks", count: securityTasks.length, estimatedDaysEach: 0.5 },
    { category: "Test Suites",    count: testingPlan.length,   estimatedDaysEach: 0.5 },
    { category: "Total estimated days", count: totalDays,      estimatedDaysEach: null }
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

function buildFromFeatures(features, serviceMap, apiMap, dbMap) {
  const services = [...BASELINE_SERVICES];
  const apis     = [...BASELINE_APIS];
  const dbTasks  = [...BASELINE_DATABASE];

  for (const feature of features) {
    matchFeature(feature, serviceMap).forEach(s => { if (!services.includes(s)) services.push(s); });
    matchFeature(feature, apiMap).forEach(a => { if (!apis.includes(a)) apis.push(a); });
    matchFeature(feature, dbMap).forEach(d => { if (!dbTasks.includes(d)) dbTasks.push(d); });
  }

  return { services, apis, dbTasks };
}


// ── Main exported agent function ──────────────────────────────────────────────

export function runBackendEngineerAgent({
  project          = {},
  technology       = {},
  requirements     = {},
  engineeringTasks = []
} = {}) {

  const projectId = project.projectId || null;
  const features  = requirements.features || [];
  const framework = detectFramework(technology);

  const { services, apis, dbTasks } = buildFromFeatures(
    features,
    FEATURE_SERVICES,
    FEATURE_APIS,
    FEATURE_DATABASE
  );

  const authentication = buildAuthentication(features);
  const integrations   = buildIntegrations(features);
  const securityTasks  = buildSecurityTasks(features);
  const testingPlan    = buildTestingPlan(features);
  const estimatedTasks = buildEstimatedTasks(services, apis, dbTasks, securityTasks, testingPlan);

  const backendPlan = createBackendEngineeringPlan({
    projectId,
    framework,
    services,
    apis,
    databaseIntegration: dbTasks,
    authentication,
    integrations,
    securityTasks,
    testingPlan,
    estimatedTasks
  });

  const totalDays = estimatedTasks.find(t => t.category === "Total estimated days")?.count || 0;

  return {
    success: true,
    agent:   "backend_engineer_agent",
    version: "1.0.0",
    backendPlan,
    _meta: {
      projectId,
      framework,
      featuresDetected:   features.length,
      servicesCount:      services.length,
      apisCount:          apis.length,
      dbTasksCount:       dbTasks.length,
      securityTasksCount: securityTasks.length,
      testingPlanCount:   testingPlan.length,
      estimatedTotalDays: totalDays,
      generatedAt:        new Date().toISOString()
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { project, technology, requirements, engineeringTasks } = req.body || {};
    if (!requirements) return res.status(400).json({ error: "requirements object required" });
    return res.status(200).json(runBackendEngineerAgent({ project, technology, requirements, engineeringTasks }));
  } catch (error) {
    console.error("BACKEND ENGINEER AGENT ERROR:", error);
    return res.status(500).json({ error: "Backend engineering plan failed" });
  }
}