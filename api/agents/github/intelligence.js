import { createRepositoryReport } from "../../repository/schema.js";

const FRONTEND_SIGNALS = {
  "react":   "React",
  "next":    "Next.js",
  "nextjs":  "Next.js",
  "next.js": "Next.js",
  "vue":     "Vue",
  "angular": "Angular",
  "svelte":  "Svelte",
  "nuxt":    "Nuxt.js",
  "gatsby":  "Gatsby"
};

const BACKEND_SIGNALS = {
  "node":    "Node.js",
  "express": "Express",
  "fastapi": "FastAPI",
  "django":  "Django",
  "flask":   "Flask",
  "rails":   "Ruby on Rails",
  "spring":  "Spring Boot",
  "laravel": "Laravel",
  "nest":    "NestJS",
  "nestjs":  "NestJS",
  "hono":    "Hono"
};

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

const OUTDATED_PACKAGES = new Set([
  "old-package", "request", "node-uuid", "jade", "bower",
  "grunt", "gulp", "moment", "lodash-compat", "react-addons-css-transition-group"
]);

const SENSITIVE_PACKAGES = new Set([
  "jsonwebtoken", "bcrypt", "bcryptjs", "crypto", "helmet", "cors", "dotenv"
]);

function normalise(value = "") {
  return String(value).toLowerCase().trim();
}

function detectFromSignals(value, signalMap) {
  const norm = normalise(value);
  for (const [signal, canonical] of Object.entries(signalMap)) {
    if (norm.includes(signal)) return canonical;
  }
  return null;
}

function detectFrontend(repositoryData) {
  if (repositoryData.frontend) {
    return detectFromSignals(repositoryData.frontend, FRONTEND_SIGNALS) || repositoryData.frontend;
  }
  for (const dep of repositoryData.dependencies || []) {
    const match = detectFromSignals(dep, FRONTEND_SIGNALS);
    if (match) return match;
  }
  return null;
}

function detectBackend(repositoryData) {
  if (repositoryData.backend) {
    return detectFromSignals(repositoryData.backend, BACKEND_SIGNALS) || repositoryData.backend;
  }
  for (const dep of repositoryData.dependencies || []) {
    const match = detectFromSignals(dep, BACKEND_SIGNALS);
    if (match) return match;
  }
  return null;
}

function detectDatabase(repositoryData) {
  if (repositoryData.database) {
    return detectFromSignals(repositoryData.database, DATABASE_SIGNALS) || repositoryData.database;
  }
  for (const dep of repositoryData.dependencies || []) {
    const match = detectFromSignals(dep, DATABASE_SIGNALS);
    if (match) return match;
  }
  return null;
}

function detectArchitecture(frontend, backend, database) {
  if (frontend && backend && database) return "full-stack application";
  if (frontend && backend)             return "full-stack application (no dedicated database)";
  if (backend  && database)            return "backend service";
  if (frontend && !backend)            return "frontend application";
  if (backend  && !frontend)           return "backend service";
  return "unknown";
}

function buildTechnologyStack(frontend, backend, database, dependencies) {
  const stack = {};
  if (frontend)             stack.frontend     = frontend;
  if (backend)              stack.backend      = backend;
  if (database)             stack.database     = database;
  if (dependencies?.length) stack.dependencies = dependencies.length + " package(s) detected";
  return stack;
}

function analyseSecurityIssues(repositoryData, dependencies) {
  const issues = [];

  if (repositoryData.secrets === true) {
    issues.push({
      severity:       "critical",
      finding:        "Exposed secrets detected in repository",
      recommendation: "Rotate all exposed credentials immediately and use a secrets manager"
    });
  }

  if (!repositoryData.authentication && !repositoryData.auth) {
    issues.push({
      severity:       "medium",
      finding:        "Authentication configuration not detected",
      recommendation: "Review authentication implementation and ensure industry-standard patterns are applied"
    });
  }

  const outdated = dependencies.filter(d => OUTDATED_PACKAGES.has(normalise(d)));
  if (outdated.length > 0) {
    issues.push({
      severity:       "medium",
      finding:        `Outdated dependency detected: ${outdated.join(", ")}`,
      recommendation: "Replace outdated packages with actively maintained alternatives"
    });
  }

  const sensitive = dependencies.filter(d => SENSITIVE_PACKAGES.has(normalise(d)));
  if (sensitive.length > 0) {
    issues.push({
      severity:       "low",
      finding:        `Security-sensitive packages in use: ${sensitive.join(", ")}`,
      recommendation: "Ensure these packages are configured correctly and kept up to date"
    });
  }

  if (repositoryData.https === false) {
    issues.push({
      severity:       "high",
      finding:        "HTTPS not enforced",
      recommendation: "Enforce HTTPS for all endpoints; redirect HTTP to HTTPS"
    });
  }

  return issues;
}

function analysePerformanceIssues(frontend, backend, database) {
  const issues = [];

  if (frontend) {
    issues.push({
      area:           "frontend",
      finding:        "Frontend bundle size and rendering performance not assessed",
      recommendation: "Review bundle optimisation, code splitting, and lazy loading strategies"
    });
  }

  if (backend) {
    issues.push({
      area:           "backend",
      finding:        "API response times and caching strategy not assessed",
      recommendation: "Review API performance, implement caching where appropriate, and profile slow endpoints"
    });
  }

  if (database) {
    issues.push({
      area:           "database",
      finding:        "Database query performance and indexing not assessed",
      recommendation: "Review slow queries, add indexes on high-frequency lookup columns, and evaluate connection pooling"
    });
  }

  return issues;
}

function buildImprovementPlan(securityIssues, performanceIssues, frontend, backend, database) {
  const plan = [];

  const criticalSecurity = securityIssues.filter(i => i.severity === "critical");
  const highSecurity     = securityIssues.filter(i => i.severity === "high");
  const mediumSecurity   = securityIssues.filter(i => i.severity === "medium");

  if (criticalSecurity.length > 0) {
    plan.push({
      priority: "high",
      area:     "security",
      action:   "Resolve critical security issues: " + criticalSecurity.map(i => i.finding).join("; ")
    });
  }

  if (highSecurity.length > 0) {
    plan.push({
      priority: "high",
      area:     "security",
      action:   "Resolve high-severity security issues: " + highSecurity.map(i => i.finding).join("; ")
    });
  }

  if (mediumSecurity.length > 0) {
    plan.push({
      priority: "medium",
      area:     "security",
      action:   "Review authentication and dependency security across the project"
    });
  }

  if (performanceIssues.length > 0) {
    plan.push({
      priority: "medium",
      area:     "performance",
      action:   "Optimise application performance across " + performanceIssues.map(i => i.area).join(", ") + " layers"
    });
  }

  if (frontend && backend && !database) {
    plan.push({
      priority: "low",
      area:     "architecture",
      action:   "Evaluate whether a persistent database layer is required for future scalability"
    });
  }

  plan.push({
    priority: "low",
    area:     "code_quality",
    action:   "Establish linting, formatting, and automated test coverage baseline"
  });

  return plan;
}

export function runGithubIntelligenceAgent({
  repositoryUrl  = null,
  projectType    = "existing",
  repositoryData = {},
  projectId      = null
} = {}) {

  const dependencies    = repositoryData.dependencies || [];
  const frontend        = detectFrontend(repositoryData);
  const backend         = detectBackend(repositoryData);
  const database        = detectDatabase(repositoryData);
  const architecture    = detectArchitecture(frontend, backend, database);
  const technologyStack = buildTechnologyStack(frontend, backend, database, dependencies);
  const securityIssues    = analyseSecurityIssues(repositoryData, dependencies);
  const performanceIssues = analysePerformanceIssues(frontend, backend, database);
  const improvementPlan   = buildImprovementPlan(securityIssues, performanceIssues, frontend, backend, database);

  const report = createRepositoryReport({
    projectId,
    repositoryUrl,
    projectType,
    technologyStack,
    frontend,
    backend,
    database,
    architecture,
    dependencies,
    securityIssues,
    performanceIssues,
    improvementPlan
  });

  return {
    success: true,
    agent:   "github_intelligence_agent",
    version: "1.0.0",
    report,
    _meta: {
      projectId,
      repositoryUrl,
      frontend,
      backend,
      database,
      architecture,
      dependenciesCount:       dependencies.length,
      securityIssuesCount:     securityIssues.length,
      performanceIssuesCount:  performanceIssues.length,
      improvementActionsCount: improvementPlan.length,
      analyzedAt:              new Date().toISOString()
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { repositoryUrl, projectType, repositoryData, projectId } = req.body || {};
    if (!repositoryData) return res.status(400).json({ error: "repositoryData object required" });
    return res.status(200).json(runGithubIntelligenceAgent({ repositoryUrl, projectType, repositoryData, projectId }));
  } catch (error) {
    console.error("GITHUB INTELLIGENCE AGENT ERROR:", error);
    return res.status(500).json({ error: "Repository analysis failed" });
  }
}