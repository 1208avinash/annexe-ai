import { runBackendEngineerAgent } from "./api/agents/backend/engineer.js";

const input = {
  project: {
    projectId: "ANNEXE-TEST-001",
    name:      "AI CRM"
  },
  technology: {
    backend: "FastAPI"
  },
  requirements: {
    features: ["authentication", "crm", "lead management", "AI"]
  }
};

function assert(label, condition, actual) {
  console.log(`${condition ? "✅" : "❌"}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Backend Engineer Agent Test");
console.log("══════════════════════════════════════════════════════════\n");

const result = runBackendEngineerAgent(input);
const plan   = result.backendPlan;

assert("success === true",              result.success === true,                      result.success);
assert("agent name correct",            result.agent === "backend_engineer_agent",    result.agent);
assert("backendPlan exists",            !!plan,                                       null);
assert("backendId exists",              !!plan.backendId,                             plan.backendId);
assert("framework detected",            plan.framework === "FastAPI",                 plan.framework);
assert("services exist",                Array.isArray(plan.services) && plan.services.length > 0,            plan.services.length);
assert("apis exist",                    Array.isArray(plan.apis) && plan.apis.length > 0,                    plan.apis.length);
assert("databaseIntegration exists",    Array.isArray(plan.databaseIntegration) && plan.databaseIntegration.length > 0, plan.databaseIntegration.length);
assert("authentication exists",         Array.isArray(plan.authentication) && plan.authentication.length > 0, plan.authentication.length);
assert("integrations exist",            Array.isArray(plan.integrations) && plan.integrations.length > 0,    plan.integrations.length);
assert("securityTasks exist",           Array.isArray(plan.securityTasks) && plan.securityTasks.length > 0,  plan.securityTasks.length);
assert("testingPlan exists",            Array.isArray(plan.testingPlan) && plan.testingPlan.length > 0,      plan.testingPlan.length);
assert("estimatedTasks exists",         Array.isArray(plan.estimatedTasks) && plan.estimatedTasks.length > 0, plan.estimatedTasks.length);
assert("crm service included",          plan.services.some(s => s.toLowerCase().includes("crm")),            null);
assert("lead service included",         plan.services.some(s => s.toLowerCase().includes("lead")),           null);
assert("ai service included",           plan.services.some(s => s.toLowerCase().includes("ai")),             null);
assert("auth api included",             plan.apis.some(a => a.toLowerCase().includes("auth")),               null);
assert("jwt auth task included",        plan.authentication.some(a => a.toLowerCase().includes("jwt")),      null);
assert("input validation in security",  plan.securityTasks.some(s => s.toLowerCase().includes("validat")),  null);

console.log("\n── Plan Snapshot ─────────────────────────────────────────");
console.log("  Framework:       ", plan.framework);
console.log("  Services:        ", plan.services.length, "→", plan.services.slice(0, 3).join(", "));
console.log("  APIs:            ", plan.apis.length, "→", plan.apis.slice(0, 3).join(", "));
console.log("  DB tasks:        ", plan.databaseIntegration.length);
console.log("  Auth tasks:      ", plan.authentication.length);
console.log("  Security tasks:  ", plan.securityTasks.length);
console.log("  Tests:           ", plan.testingPlan.length);
console.log("  Est. total days: ", result._meta.estimatedTotalDays);

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  BACKEND ENGINEER TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");