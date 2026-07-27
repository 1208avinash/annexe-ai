import { runFrontendEngineerAgent } from "./api/agents/frontend/engineer.js";

const input = {
  project: {
    projectId: "ANNEXE-TEST-001",
    name:      "AI CRM"
  },
  technology: {
    frontend: "Next.js"
  },
  requirements: {
    features: ["dashboard", "crm", "authentication"]
  }
};

function assert(label, condition, actual) {
  console.log(`${condition ? "✅" : "❌"}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Frontend Engineer Agent Test");
console.log("══════════════════════════════════════════════════════════\n");

const result = runFrontendEngineerAgent(input);
const plan   = result.frontendPlan;

assert("success === true",            result.success === true,                       result.success);
assert("agent name correct",          result.agent === "frontend_engineer_agent",    result.agent);
assert("frontendPlan exists",         !!plan,                                        null);
assert("frontendId exists",           !!plan.frontendId,                             plan.frontendId);
assert("framework detected",          plan.framework === "Next.js",                  plan.framework);
assert("components exist",            Array.isArray(plan.components) && plan.components.length > 0, plan.components.length);
assert("pages exist",                 Array.isArray(plan.pages) && plan.pages.length > 0,           plan.pages.length);
assert("uiTasks exist",               Array.isArray(plan.uiTasks) && plan.uiTasks.length > 0,       plan.uiTasks.length);
assert("stateManagement exists",      Array.isArray(plan.stateManagement) && plan.stateManagement.length > 0, plan.stateManagement.length);
assert("apiIntegration exists",       Array.isArray(plan.apiIntegration) && plan.apiIntegration.length > 0,   plan.apiIntegration.length);
assert("testingPlan exists",          Array.isArray(plan.testingPlan) && plan.testingPlan.length > 0,         plan.testingPlan.length);
assert("estimatedTasks exists",       Array.isArray(plan.estimatedTasks) && plan.estimatedTasks.length > 0,   plan.estimatedTasks.length);
assert("dashboard page included",     plan.pages.includes("Dashboard"),              null);
assert("login page included",         plan.pages.includes("Login"),                  null);
assert("crm page included",           plan.pages.some(p => p.toLowerCase().includes("crm")), null);
assert("nav component included",      plan.components.includes("Navigation"),        null);
assert("auth state included",         plan.stateManagement.some(s => s.toLowerCase().includes("auth")), null);

console.log("\n── Plan Snapshot ─────────────────────────────────────────");
console.log("  Framework:   ", plan.framework);
console.log("  Pages:       ", plan.pages.length, "→", plan.pages.slice(0, 4).join(", "));
console.log("  Components:  ", plan.components.length, "→", plan.components.slice(0, 4).join(", "));
console.log("  UI Tasks:    ", plan.uiTasks.length);
console.log("  State items: ", plan.stateManagement.length);
console.log("  API items:   ", plan.apiIntegration.length);
console.log("  Tests:       ", plan.testingPlan.length);
console.log("  Est. days:   ", result._meta.estimatedTotalDays);

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  FRONTEND ENGINEER TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");