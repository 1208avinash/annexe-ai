// ────────────────────────────────────────────────────────────────
// ANNEXE AI — Autonomous Decision Engine Test
//
// Phase 9.1 contract test.
//
// Verifies:
//
//   DecisionEngine
//        ↓
//   WorkflowPlanner
//        ↓
//   Decision result
//
// Does NOT modify production code.
//
// Run:
//   node test-decision-engine.js
//
// ────────────────────────────────────────────────────────────────


import { DecisionEngine } from "./api/orchestrator/decision-engine.js";


// ── Assertion helper ────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual) {

  if (condition) {

    console.log(`  ✅  ${label}`);
    passed++;

  } else {

    console.error(`  ❌  ${label} → got: ${JSON.stringify(actual)}`);
    failed++;

  }

}


// ────────────────────────────────────────────────────────────────
// Stage 1 — LOW complexity decision
// ────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");
console.log("  Stage 1 — LOW complexity project");
console.log("════════════════════════════════════════\n");


const engine = new DecisionEngine();


const lowDecision = engine.analyze({

  name: "Marketing Website",

  description: "Simple landing page",

  requirements: [
    "content pages",
    "contact form"
  ]

});


assert(
  "decision returns object",
  lowDecision !== null && lowDecision !== undefined,
  lowDecision
);


assert(
  "success === true",
  lowDecision?.success === true,
  lowDecision?.success
);


assert(
  "complexity === LOW",
  lowDecision?.complexity === "LOW",
  lowDecision?.complexity
);


assert(
  "approvalRequired === false",
  lowDecision?.approvalRequired === false,
  lowDecision?.approvalRequired
);



// ────────────────────────────────────────────────────────────────
// Stage 2 — HIGH complexity SaaS decision
// ────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");
console.log("  Stage 2 — HIGH complexity SaaS project");
console.log("════════════════════════════════════════\n");


const highDecision = engine.analyze({

  name: "AI SaaS CRM Platform",

  description: "Multi tenant AI sales automation platform",

  requirements: [
    "multi tenant",
    "billing",
    "AI assistant",
    "customer management"
  ]

});


assert(
  "saas project detected",
  highDecision?.projectType === "saas",
  highDecision?.projectType
);


assert(
  "complexity === HIGH",
  highDecision?.complexity === "HIGH",
  highDecision?.complexity
);


assert(
  "approvalRequired === true",
  highDecision?.approvalRequired === true,
  highDecision?.approvalRequired
);



// ────────────────────────────────────────────────────────────────
// Stage 3 — Planner integration
// ────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");
console.log("  Stage 3 — Planner integration");
console.log("════════════════════════════════════════\n");


assert(
  "workflow plan exists",
  highDecision?.plan !== undefined,
  highDecision?.plan
);


assert(
  "plan contains tasks",
  Array.isArray(highDecision?.plan?.tasks)
    && highDecision.plan.tasks.length > 0,
  highDecision?.plan?.tasks
);


assert(
  "plan projectType matches decision",
  highDecision?.plan?.projectType === highDecision?.projectType,
  {
    plan: highDecision?.plan?.projectType,
    decision: highDecision?.projectType
  }
);



// ────────────────────────────────────────────────────────────────
// Stage 4 — Unknown project fallback
// ────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");
console.log("  Stage 4 — Unknown project fallback");
console.log("════════════════════════════════════════\n");


const unknownDecision = engine.analyze({

  name: "Random Application"

});


assert(
  "unknown project succeeds",
  unknownDecision?.success === true,
  unknownDecision?.success
);


assert(
  "workflow strategy exists",
  !!unknownDecision?.workflowStrategy,
  unknownDecision?.workflowStrategy
);



// ────────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════════════");
console.log(`  Decision Engine Test — ${passed} passed, ${failed} failed`);

if (failed === 0) {

  console.log("  ✅ DECISION ENGINE TEST PASSED");

} else {

  console.log("  ❌ DECISION ENGINE TEST FAILED");

}

console.log("════════════════════════════════════════\n");


process.exitCode = failed === 0 ? 0 : 1;