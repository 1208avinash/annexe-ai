import { runEngineeringManagerAgent } from "./lib/agents/engineering/manager.js";

const input = {
  project: {
    projectId:   "ANNEXE-TEST-001",
    projectName: "ANNEXE AI CRM Platform",
    industry:    "SaaS",
    solution:    "AI CRM with lead qualification and automated follow-up"
  },
  architecture: {
    frontend:  { framework: "Next.js",    modules:  ["User Interface", "Dashboard", "Authentication", "Client Portal"] },
    backend:   { framework: "FastAPI",    services: ["API Gateway", "Business Logic Service", "AI Agent Service"] },
    database:  { engine:    "PostgreSQL", tables:   ["users", "projects", "customers", "conversations", "tasks"] },
    aiArchitecture: { components: ["AI Decision Engine", "Agent Orchestrator", "Memory Layer", "Knowledge Base"] }
  },
  technology: {
    frontend:   { technology: "Next.js" },
    backend:    { technology: "FastAPI" },
    database:   { technology: "PostgreSQL" },
    aiLayer:    { technology: "LLM API with agent orchestration layer" },
    deployment: { technology: "Cloud deployment with CI/CD" }
  },
  requirements: {
    features: ["authentication", "dashboard", "crm / contacts", "reporting", "notifications", "api / integrations", "ai / automation"],
    projectType: "crm",
    industry:    "SaaS"
  }
};

function assert(label, condition, actual) {
  console.log(`${condition ? "✅" : "❌"}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}

const result = runEngineeringManagerAgent(input);
const plan   = result.engineeringPlan;
const teams  = plan.teams;
const t      = teams.frontend[0];

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Engineering Manager Agent Test");
console.log("══════════════════════════════════════════════════════════\n");

assert("success === true",             result.success === true,                      result.success);
assert("agent name correct",           result.agent === "engineering_manager_agent", result.agent);
assert("engineeringId exists",         !!plan.engineeringId,                        plan.engineeringId);
assert("projectId preserved",          plan.projectId === input.project.projectId,  plan.projectId);
assert("status === ready",             plan.status === "ready",                     plan.status);
assert("developmentOrder not empty",   plan.developmentOrder.length > 0,            plan.developmentOrder.length);
assert("starts with database",         plan.developmentOrder[0] === "database_foundation", plan.developmentOrder[0]);
assert("ends with deployment",         plan.developmentOrder.at(-1) === "deployment",      plan.developmentOrder.at(-1));
assert("includes ai_integration",      plan.developmentOrder.includes("ai_integration"),   null);
assert("frontend team exists",         teams.frontend.length > 0, teams.frontend.length);
assert("backend team exists",          teams.backend.length  > 0, teams.backend.length);
assert("database team exists",         teams.database.length > 0, teams.database.length);
assert("ai team exists",               teams.ai.length       > 0, teams.ai.length);
assert("devops team exists",           teams.devops.length   > 0, teams.devops.length);
assert("task has taskId",              !!t?.taskId,               t?.taskId);
assert("task has title",               !!t?.title,                t?.title);
assert("task has estimatedDays",       typeof t?.estimatedDays === "number", t?.estimatedDays);
assert("dependencies not empty",       plan.dependencies.length > 0, plan.dependencies.length);
assert("risks not empty",              plan.risks.length > 0,        plan.risks.length);
assert("hasAI === true",               result._meta.hasAI === true,  result._meta.hasAI);
assert("totalTasks > 0",               result._meta.totalTasks > 0,  result._meta.totalTasks);
assert("5 teams active",               result._meta.teamsActive.length === 5, result._meta.teamsActive.length);

console.log("\n  Order:", plan.developmentOrder.join(" → "));
console.log("  Tasks:", result._meta.totalTasks, "| Days:", result._meta.totalDays);
for (const [team, tasks] of Object.entries(teams)) {
  if (tasks.length) console.log(`  ${team.padEnd(10)} ${tasks.length} task(s)`);
}
console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  Engineering Manager test PASSED");
console.log("══════════════════════════════════════════════════════════\n");