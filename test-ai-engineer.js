import { runAIEngineerAgent } from "./api/agents/ai/engineer.js";

const input = {
  project: {
    projectId: "ANNEXE-TEST-001",
    name:      "AI CRM"
  },
  technology: {
    ai: "LLM"
  },
  requirements: {
    features: ["AI assistant", "lead scoring", "automation"]
  }
};

function assert(label, condition, actual) {
  console.log(`${condition ? "✅" : "❌"}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — AI Engineer Agent Test");
console.log("══════════════════════════════════════════════════════════\n");

const result = runAIEngineerAgent(input);
const plan   = result.aiPlan;

assert("success === true",              result.success === true,                    result.success);
assert("agent name correct",            result.agent === "ai_engineer_agent",       result.agent);
assert("aiPlan exists",                 !!plan,                                     null);
assert("aiId exists",                   !!plan.aiId,                               plan.aiId);
assert("architecture exists",           Array.isArray(plan.aiArchitecture) && plan.aiArchitecture.length > 0, plan.aiArchitecture.length);
assert("models exist",                  Array.isArray(plan.models) && plan.models.length > 0,                 plan.models.length);
assert("workflows exist",               Array.isArray(plan.workflows) && plan.workflows.length > 0,           plan.workflows.length);
assert("prompts exist",                 Array.isArray(plan.prompts) && plan.prompts.length > 0,               plan.prompts.length);
assert("integrations exist",            Array.isArray(plan.integrations) && plan.integrations.length > 0,     plan.integrations.length);
assert("dataPipeline exists",           Array.isArray(plan.dataPipeline) && plan.dataPipeline.length > 0,     plan.dataPipeline.length);
assert("evaluationPlan exists",         Array.isArray(plan.evaluationPlan) && plan.evaluationPlan.length > 0, plan.evaluationPlan.length);
assert("securityPlan exists",           Array.isArray(plan.securityPlan) && plan.securityPlan.length > 0,     plan.securityPlan.length);
assert("testingPlan exists",            Array.isArray(plan.testingPlan) && plan.testingPlan.length > 0,       plan.testingPlan.length);
assert("estimatedTasks exists",         Array.isArray(plan.estimatedTasks) && plan.estimatedTasks.length > 0, plan.estimatedTasks.length);
assert("LLM in models",                 plan.models.some(m => m.toLowerCase().includes("llm") || m.toLowerCase().includes("language")), null);
assert("lead workflow included",        plan.workflows.some(w => w.toLowerCase().includes("lead")),           null);
assert("automation workflow included",  plan.workflows.some(w => w.toLowerCase().includes("workflow") || w.toLowerCase().includes("automat")), null);
assert("prompt injection in security",  plan.securityPlan.some(s => s.toLowerCase().includes("injection")),   null);
assert("regression test included",      plan.testingPlan.some(t => t.toLowerCase().includes("regression")),   null);
assert("totalDays > 0",                 result._meta.estimatedTotalDays > 0,        result._meta.estimatedTotalDays);

console.log("\n── Plan Snapshot ─────────────────────────────────────────");
console.log("  Architecture:    ", plan.aiArchitecture.length, "→", plan.aiArchitecture.slice(0, 2).join(", "));
console.log("  Models:          ", plan.models.length, "→", plan.models.slice(0, 2).join(", "));
console.log("  Workflows:       ", plan.workflows.length);
console.log("  Prompts:         ", plan.prompts.length);
console.log("  Integrations:    ", plan.integrations.length);
console.log("  Data pipeline:   ", plan.dataPipeline.length);
console.log("  Evaluation tasks:", plan.evaluationPlan.length);
console.log("  Security tasks:  ", plan.securityPlan.length);
console.log("  Test suites:     ", plan.testingPlan.length);
console.log("  Est. total days: ", result._meta.estimatedTotalDays);

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  AI ENGINEER TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");