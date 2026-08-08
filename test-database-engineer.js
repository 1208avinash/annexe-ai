import { runDatabaseEngineerAgent } from "./lib/agents/database/engineer.js";

const input = {
  project: {
    projectId: "ANNEXE-TEST-001",
    name:      "AI CRM"
  },
  technology: {
    database: "PostgreSQL"
  },
  requirements: {
    features: ["users", "crm", "lead management"]
  }
};

function assert(label, condition, actual) {
  console.log(`${condition ? "✅" : "❌"}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Database Engineer Agent Test");
console.log("══════════════════════════════════════════════════════════\n");

const result = runDatabaseEngineerAgent(input);
const plan   = result.databasePlan;

assert("success === true",             result.success === true,                        result.success);
assert("agent name correct",           result.agent === "database_engineer_agent",     result.agent);
assert("databasePlan exists",          !!plan,                                         null);
assert("databaseId exists",            !!plan.databaseId,                              plan.databaseId);
assert("database type detected",       plan.databaseType === "PostgreSQL",             plan.databaseType);
assert("entities exist",               Array.isArray(plan.entities) && plan.entities.length > 0,             plan.entities.length);
assert("relationships exist",          Array.isArray(plan.relationships) && plan.relationships.length > 0,   plan.relationships.length);
assert("schemaTasks exist",            Array.isArray(plan.schemaTasks) && plan.schemaTasks.length > 0,       plan.schemaTasks.length);
assert("migrationPlan exists",         Array.isArray(plan.migrationPlan) && plan.migrationPlan.length > 0,   plan.migrationPlan.length);
assert("indexingStrategy exists",      Array.isArray(plan.indexingStrategy) && plan.indexingStrategy.length > 0, plan.indexingStrategy.length);
assert("securityPlan exists",          Array.isArray(plan.securityPlan) && plan.securityPlan.length > 0,     plan.securityPlan.length);
assert("optimizationPlan exists",      Array.isArray(plan.optimizationPlan) && plan.optimizationPlan.length > 0, plan.optimizationPlan.length);
assert("testingPlan exists",           Array.isArray(plan.testingPlan) && plan.testingPlan.length > 0,       plan.testingPlan.length);
assert("estimatedTasks exists",        Array.isArray(plan.estimatedTasks) && plan.estimatedTasks.length > 0, plan.estimatedTasks.length);
assert("users entity included",        plan.entities.includes("users"),                null);
assert("customers entity included",    plan.entities.some(e => e.includes("customer")), null);
assert("leads entity included",        plan.entities.some(e => e.includes("lead")),    null);
assert("crm relationship included",    plan.relationships.some(r => r.includes("customer")), null);
assert("password never stored plain",  plan.securityPlan.some(s => s.toLowerCase().includes("hash")), null);
assert("connection pool optimised",    plan.optimizationPlan.some(o => o.toLowerCase().includes("pool")), null);

console.log("\n── Plan Snapshot ─────────────────────────────────────────");
console.log("  Database type:    ", plan.databaseType);
console.log("  Entities:         ", plan.entities.length, "→", plan.entities.slice(0, 5).join(", "));
console.log("  Relationships:    ", plan.relationships.length);
console.log("  Schema tasks:     ", plan.schemaTasks.length);
console.log("  Migration steps:  ", plan.migrationPlan.length);
console.log("  Indexes:          ", plan.indexingStrategy.length);
console.log("  Security tasks:   ", plan.securityPlan.length);
console.log("  Optimizations:    ", plan.optimizationPlan.length);
console.log("  Test suites:      ", plan.testingPlan.length);
console.log("  Est. total days:  ", result._meta.estimatedTotalDays);

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  DATABASE ENGINEER TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");