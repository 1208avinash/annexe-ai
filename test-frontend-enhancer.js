// ── ANNEXE AI — Frontend Enhancer Agent Test Suite ───────────────────────────
// Run: node test-frontend-enhancer.js
// ─────────────────────────────────────────────────────────────────────────────

import { runFrontendEnhancer }      from "./api/agents/frontend/enhancer.js";
import { runFrontendEnhancerAgent } from "./api/agents/frontend/enhancer-agent.js";


// ── Test harness ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}


// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockFrontendPlan = {
  framework:  "Next.js",
  modules:    ["Dashboard", "Authentication", "Client Portal"],
  styling:    "Tailwind CSS",
  stateLayer: "React Context + React Query",
  testing:    "Jest + Playwright"
};

const mockBackendPlan = {
  framework: "FastAPI",
  services:  ["API Gateway", "Auth Service", "Business Logic Service"]
};

const mockArchitecture = {
  frontend: { framework: "Next.js", modules: ["Dashboard", "Authentication"] },
  backend:  { framework: "FastAPI",  services: ["API Gateway"] },
  database: { engine: "PostgreSQL" }
};

const mockRequirements = {
  projectType: "saas",
  features:    ["authentication", "dashboard", "notifications", "api / integrations"],
  users:       ["admin", "customer"],
  priority:    "high"
};

const REQUIRED_CATEGORIES = ["uiArchitecture", "apiIntegration", "performance", "security", "ux"];


// ── Tests ─────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════");
console.log("  ANNEXE AI — Frontend Enhancer Agent Tests  ");
console.log("══════════════════════════════════════════════\n");


console.log("[ 1 ] Import checks");
test("runFrontendEnhancer is a function",      typeof runFrontendEnhancer      === "function");
test("runFrontendEnhancerAgent is a function", typeof runFrontendEnhancerAgent === "function");
test("wrapper and enhancer are the same function", runFrontendEnhancerAgent    === runFrontendEnhancer);
console.log();


console.log("[ 2 ] Valid input — frontendPlan accepted");
const result = await runFrontendEnhancer({
  frontendPlan:  mockFrontendPlan,
  backendPlan:   mockBackendPlan,
  architecture:  mockArchitecture,
  requirements:  mockRequirements
});
test("Call resolves without throwing",           result !== undefined && result !== null);
test("success is true",                          result.success === true,         JSON.stringify(result));
test("agent field identifies the agent",         result.agent === "frontend_enhancer_agent", `got: ${result.agent}`);
test("frontendPlan accepted — no error on success", !result.error);
console.log();


console.log("[ 3 ] enhancements object shape");
test("enhancements property exists",   result.enhancements !== undefined && result.enhancements !== null);
test("enhancements is a plain object", typeof result.enhancements === "object" && !Array.isArray(result.enhancements));
console.log();


console.log("[ 4 ] All 5 enhancement categories");
for (const category of REQUIRED_CATEGORIES) {
  test(`enhancements.${category} exists`, category in result.enhancements && result.enhancements[category] !== null);
}
console.log();


console.log("[ 5 ] Category content is non-empty");
for (const category of REQUIRED_CATEGORIES) {
  const value    = result.enhancements[category];
  const nonEmpty = value && Object.keys(value).length > 0;
  test(`enhancements.${category} has at least one key`, nonEmpty);
}
console.log();


console.log("[ 6 ] Invalid input — no arguments");
const badResult = await runFrontendEnhancer();
test("Call resolves (does not throw) on empty input", badResult !== undefined);
test("success is false on empty input",               badResult.success === false, JSON.stringify(badResult));
test("error message is returned",                     typeof badResult.error === "string" && badResult.error.length > 0);
console.log();


console.log("[ 7 ] enhancer-agent.js wrapper — identical output");
const agentResult = await runFrontendEnhancerAgent({
  frontendPlan:  mockFrontendPlan,
  architecture:  mockArchitecture,
  requirements:  mockRequirements
});
test("wrapper call succeeds",                          agentResult.success === true);
test("wrapper produces same agent identifier",         agentResult.agent === "frontend_enhancer_agent");
test("wrapper enhancements contains all 5 categories", REQUIRED_CATEGORIES.every(k => k in agentResult.enhancements));
console.log();


console.log("[ 8 ] Partial input — architecture only (no frontendPlan)");
const partialResult = await runFrontendEnhancer({ architecture: mockArchitecture });
test("Partial input succeeds",                         partialResult.success === true);
test("All 5 categories still present with partial input", REQUIRED_CATEGORIES.every(k => k in partialResult.enhancements));
console.log();


// ── Summary ───────────────────────────────────────────────────────────────────

const total = passed + failed;
console.log("══════════════════════════════════════════════");
console.log(`  Results: ${passed} / ${total} passed`);
console.log(failed === 0 ? "  Status:  ✓ ALL TESTS PASSED" : `  Status:  ✗ ${failed} TESTS FAILED`);
console.log("══════════════════════════════════════════════\n");

process.exit(failed === 0 ? 0 : 1);