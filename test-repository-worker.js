// ── ANNEXE AI — Repository Worker Adapter Test ───────────────────────────────
//
// Verifies repository_worker in agent-adapters.js correctly connects
// the generation layer to the repository integration layer.
//
// Return shape from integrateGenerationResult (from integration.js):
//   {
//     success:        true,
//     status:         "READY_FOR_REVIEW",
//     repository: {
//       repositoryUrl,
//       branch:       branch.branch,
//       commit:       commit.commit,
//       pullRequest:  pullRequest.pullRequest
//     },
//     generatedFiles: <number>,
//     createdAt:      <ISO string>,
//     agent:          "repository_worker"   ← added by adapter
//   }
//
// Run: node test-repository-worker.js
// ─────────────────────────────────────────────────────────────────────────────

import { runAgentAdapter } from "./api/orchestrator/agent-adapters.js";


// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}  →  got: ${JSON.stringify(actual)}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 56 - title.length))}`);
}


// ── Test data ─────────────────────────────────────────────────────────────────

const PROJECT_ID = "REPO-WORKER-TEST-" + Date.now();

const FAKE_GENERATION_RESULT = {
  success: true,
  generatedFiles: [
    { path: "src/App.jsx",       content: "export default App" },
    { path: "src/api/users.js",  content: "export const getUsers = () => [];" }
  ],
  validation: { success: true }
};

const FAKE_TASK = {
  id:   "TASK-001",
  name: "App Component Generation"
};


// ── Run ───────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Repository Worker Test");
console.log("══════════════════════════════════════════════════════════");


// ── Step 1: Successful generation → repository integration ────────────────────

section("Step 1 — Successful generation result");

const result = await runAgentAdapter("repository_worker", {
  projectId:        PROJECT_ID,
  task:             FAKE_TASK,
  generationResult: FAKE_GENERATION_RESULT
});

console.log("\n  [RESULT SHAPE]", {
  agent:          result.agent,
  success:        result.success,
  status:         result.status,
  hasBranch:      !!result.repository?.branch,
  hasCommit:      !!result.repository?.commit,
  hasPullRequest: !!result.repository?.pullRequest,
  generatedFiles: result.generatedFiles
});

assert("result.agent === 'repository_worker'",
  result.agent === "repository_worker",
  result.agent
);

assert("result.success === true",
  result.success === true,
  result.success
);

assert("result.status === 'READY_FOR_REVIEW'",
  result.status === "READY_FOR_REVIEW",
  result.status
);

assert("branch created (result.repository.branch present)",
  !!result.repository?.branch,
  result.repository?.branch
);

assert("commit created (result.repository.commit present)",
  !!result.repository?.commit,
  result.repository?.commit
);

assert("pullRequest created (result.repository.pullRequest present)",
  !!result.repository?.pullRequest,
  result.repository?.pullRequest
);

assert("generatedFiles count === 2",
  result.generatedFiles === 2,
  result.generatedFiles
);

assert("createdAt is a string",
  typeof result.createdAt === "string",
  result.createdAt
);


// ── Step 2: Failed generation → rejected ──────────────────────────────────────

section("Step 2 — Failed generation result (success: false)");

const failResult = await runAgentAdapter("repository_worker", {
  projectId:        PROJECT_ID,
  task:             FAKE_TASK,
  generationResult: { success: false, error: "Sandbox validation failed" }
});

console.log("\n  [FAIL RESULT]", {
  agent:   failResult.agent,
  success: failResult.success,
  stage:   failResult.stage,
  error:   failResult.error
});

assert("failure: agent === 'repository_worker'",
  failResult.agent === "repository_worker",
  failResult.agent
);

assert("failure: success === false",
  failResult.success === false,
  failResult.success
);

assert("failure: repository creation rejected (no pullRequest)",
  !failResult.repository?.pullRequest,
  failResult.repository?.pullRequest
);

assert("failure: error message present",
  typeof failResult.error === "string" && failResult.error.length > 0,
  failResult.error
);


// ── Step 3: Empty generatedFiles → rejected ───────────────────────────────────

section("Step 3 — Empty generatedFiles array");

const emptyResult = await runAgentAdapter("repository_worker", {
  projectId:        PROJECT_ID,
  task:             FAKE_TASK,
  generationResult: { success: true, generatedFiles: [], validation: { success: true } }
});

console.log("\n  [EMPTY RESULT]", {
  agent:   emptyResult.agent,
  success: emptyResult.success,
  stage:   emptyResult.stage,
  error:   emptyResult.error
});

assert("empty: agent === 'repository_worker'",
  emptyResult.agent === "repository_worker",
  emptyResult.agent
);

assert("empty: success === false",
  emptyResult.success === false,
  emptyResult.success
);

assert("empty: repository creation rejected (no pullRequest)",
  !emptyResult.repository?.pullRequest,
  emptyResult.repository?.pullRequest
);


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log(`  ${failed === 0 ? "✅" : "❌"}  ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  REPOSITORY WORKER TEST PASSED");
  console.log("  branch ✓  commit ✓  pull request ✓  rejection ✓");
} else {
  console.log("  SOME TESTS FAILED");
  process.exit(1);
}

console.log("══════════════════════════════════════════════════════════\n");
