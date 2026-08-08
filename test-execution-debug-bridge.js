/*
  ANNEXE AI — EXECUTION DEBUG BRIDGE INTEGRATION TEST
  =====================================================
  Proves the full failure handoff chain:

    Execution Failure
          ↓
    Debug Bridge
          ↓
    Debug Worker
          ↓
    Diagnosis
          ↓
    Patch Proposal

  READ-ONLY: does not modify any production file.
*/

import { sendExecutionFailureToDebug }
  from "./lib/orchestrator/execution-debug-bridge.js";


// ── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, extra = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${extra ? " — " + extra : ""}`);
    failed++;
  }
}


// ── Test Input ───────────────────────────────────────────────────────────────

const projectId = "DEBUG-BRIDGE-TEST-001";

const executionResult = {
  success: false,
  executionReport: {
    logs: {
      errors: [
        "Module not found: express",
        "npm ERR! build failed"
      ],
      warnings: [],
      output:
        "Error: Cannot find module express",
      commands: [
        "npm install",
        "npm run build"
      ]
    }
  }
};

const generatedFiles = [
  {
    path:    "src/server.js",
    content: "import express from 'express'"
  }
];


// ── Run Bridge ───────────────────────────────────────────────────────────────

console.log("\n════════════════════════════════");
console.log("  EXECUTION DEBUG BRIDGE — INTEGRATION TEST");
console.log("════════════════════════════════\n");

console.log(`  projectId        : ${projectId}`);
console.log(`  executionResult  : success=${executionResult.success}`);
console.log(`  generatedFiles   : ${generatedFiles.length} file(s)\n`);

const result = sendExecutionFailureToDebug({
  projectId,
  executionResult,
  generatedFiles
});

console.log("  Raw bridge output:\n");
console.log(JSON.stringify(result, null, 2));
console.log();


// ── Stage Assertions ─────────────────────────────────────────────────────────

console.log("  ── Stage Assertions ──\n");

// Stage 1 — bridge returns an object
assert(
  "Stage 1 — bridge returns object",
  result !== null && typeof result === "object"
);

// Stage 2 — success === true
assert(
  "Stage 2 — success === true",
  result.success === true,
  `got success=${result.success}, error=${result.error}`
);

// Stage 3 — debugResult exists
assert(
  "Stage 3 — debugResult exists",
  result.debugResult !== undefined && result.debugResult !== null
);

// Stage 4 — diagnosis exists
assert(
  "Stage 4 — diagnosis exists",
  result.debugResult?.diagnosis !== undefined
);

// Stage 5 — patchPlan exists
assert(
  "Stage 5 — patchPlan exists",
  result.debugResult?.patchPlan !== undefined
);

// Stage 6 — patchPlan is array
assert(
  "Stage 6 — patchPlan is array",
  Array.isArray(result.debugResult?.patchPlan)
);

// Stage 7 — error categories exist
//
// The bridge serialises executionResult.executionReport.logs (an object)
// via JSON.stringify, so the analyzer receives text that contains:
//   - "build failed"  → triggers BUILD_FAILED
//   - "Cannot find module" is inside output string → triggers DEP_NOT_FOUND
//
// At minimum the diagnosis must report at least one detected error,
// confirming the analyzer processed the converted log text.
const errorCount = result.debugResult?.diagnosis?.errorCount?.total ?? 0;
assert(
  "Stage 7 — error categories exist (≥1 error detected in diagnosis)",
  errorCount >= 1,
  `errorCount.total=${errorCount}`
);


// ── Summary ──────────────────────────────────────────────────────────────────

const total = passed + failed;

console.log("\n════════════════════════════════");

if (failed === 0) {
  console.log(`✅ ${passed} passed, 0 failed`);
  console.log("EXECUTION DEBUG BRIDGE TEST PASSED");
} else {
  console.log(`❌ ${passed} passed, ${failed} failed (of ${total})`);
  console.log("EXECUTION DEBUG BRIDGE TEST FAILED");
}

console.log("════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
