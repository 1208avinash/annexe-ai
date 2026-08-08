/*
  ANNEXE DEBUG WORKER — PATCHER
  ================================
  WHY THIS FILE EXISTS:
  Separates "what is wrong" (analyzer) from "how to fix it" (patcher).
  V1 is intentionally read-only: it proposes patches but never writes them.
  This lets the system validate proposals before a future V2 applies them.

  V1 CONTRACT:
  - Input:  diagnosis object from analyzer.js
  - Output: patchPlan array — each entry is a self-contained repair proposal
  - NEVER writes to disk, NEVER modifies generatedFiles

  PATCH PROPOSAL SCHEMA:
  {
    patchId:     string   — unique ID for traceability
    priority:    "high" | "medium" | "low"
    targetError: string   — errorId from analyzer
    file:        string | null — affected file path if known
    action:      string   — human-readable action verb
    description: string   — what to do
    suggestion:  string   — concrete code/command hint
    automated:   boolean  — whether V2 could auto-apply this
  }
*/


/*
  REPAIR PLAYBOOK
  Maps errorId → repair strategy factory.
  Each factory receives the matched error object and returns a patch proposal.
*/
const REPAIR_PLAYBOOK = {

  DEP_NOT_FOUND: (error) => ({
    action:      "install-dependency",
    priority:    "high",
    description: `Install missing module referenced in the build.`,
    suggestion:  `npm install ${extractModuleName(error.raw)} --save`,
    automated:   true
  }),

  DEP_VERSION_CONFLICT: (error) => ({
    action:      "resolve-peer-dependency",
    priority:    "high",
    description: "Resolve peer dependency version conflict.",
    suggestion:  "Review package.json peer deps; run: npm ls to inspect the tree; pin or upgrade conflicting packages.",
    automated:   false
  }),

  SYNTAX_ERROR: (error) => ({
    action:      "fix-syntax",
    priority:    "high",
    description: `Fix syntax error near line ${error.line}.`,
    suggestion:  `Review file around line ${error.line}. Check for unclosed brackets, missing semicolons, or invalid tokens.`,
    automated:   false
  }),

  IMPORT_ERROR: (error) => ({
    action:      "fix-import",
    priority:    "high",
    description: "Correct named import — the export does not exist in the target module.",
    suggestion:  "Check the module's actual exports. Update import to use the correct exported name or use default import.",
    automated:   false
  }),

  TYPE_ERROR: (error) => ({
    action:      "fix-type-error",
    priority:    "high",
    description: `TypeError at line ${error.line}. Likely null/undefined access or wrong argument type.`,
    suggestion:  `Add null guard: if (!value) return; — or verify the type of the argument being passed.`,
    automated:   false
  }),

  BUILD_FAILED: (error) => ({
    action:      "diagnose-build",
    priority:    "high",
    description: "Build process exited with non-zero status.",
    suggestion:  "Scroll up in build log for the root cause — this error usually follows a more specific error above it.",
    automated:   false
  }),

  UNDEFINED_VAR: (error) => ({
    action:      "fix-undefined-reference",
    priority:    "high",
    description: `Variable or function used before definition near line ${error.line}.`,
    suggestion:  `Declare or import the identifier before use. Check for typos in the variable name.`,
    automated:   false
  }),

  LINT_ERROR: (error) => ({
    action:      "fix-lint",
    priority:    "medium",
    description: "Lint rule violation detected.",
    suggestion:  "Run: npx eslint --fix . — for auto-fixable rules. Review remaining issues manually.",
    automated:   true
  }),

  TEST_FAILED: (error) => ({
    action:      "fix-test",
    priority:    "high",
    description: `Test failure at line ${error.line}.`,
    suggestion:  "Review the assertion. Check if the implementation changed without updating the test expectations.",
    automated:   false
  }),

  TEST_TIMEOUT: (error) => ({
    action:      "fix-timeout",
    priority:    "medium",
    description: "Test is exceeding the configured timeout.",
    suggestion:  "Increase jest.setTimeout() for async tests, or check for unresolved promises and missing await.",
    automated:   false
  }),

  RUNTIME_CRASH: (error) => ({
    action:      "fix-runtime-crash",
    priority:    "high",
    description: "Unhandled promise rejection or uncaught exception.",
    suggestion:  "Wrap async operations in try/catch. Add process.on('unhandledRejection') handler for visibility.",
    automated:   false
  }),

  NETWORK_ERROR: (error) => ({
    action:      "check-network-config",
    priority:    "medium",
    description: "Network/connection failure — service may be unreachable.",
    suggestion:  "Verify service URL and port. Check environment variables for correct endpoint configuration.",
    automated:   false
  })

};


/*
  extractModuleName
  Pulls the module name from a "Cannot find module 'x'" raw log line.
*/
function extractModuleName(rawLine) {
  const m = rawLine.match(/cannot find module ['"]([^'"]+)['"]/i);
  return m ? m[1] : "<module>";
}


/*
  priorityWeight
  For sorting patch plan by priority.
*/
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };


/*
  buildPatchPlan
  Main export. Pure function — no side effects, no file I/O.
  Takes the diagnosis from analyzer.js and produces ordered repair proposals.
*/
export function buildPatchPlan(diagnosis) {

  if (!diagnosis || diagnosis.status === "clean") {
    return [];
  }

  const proposals = [];
  const seenErrorIds = new Set();

  for (const error of diagnosis.errors) {

    // De-duplicate by errorId — one proposal per error type is enough for V1
    if (seenErrorIds.has(error.errorId)) continue;
    seenErrorIds.add(error.errorId);

    const factory = REPAIR_PLAYBOOK[error.errorId];

    if (!factory) {
      // Unknown error type — create a generic investigation proposal
      proposals.push({
        patchId:     `PATCH-UNKNOWN-${error.errorId}-${Date.now()}`,
        priority:    "medium",
        targetError: error.errorId,
        file:        null,
        action:      "investigate",
        description: `Unknown error pattern at line ${error.line}: ${error.message}`,
        suggestion:  `Manually review log line ${error.line}: "${error.raw}"`,
        automated:   false
      });
      continue;
    }

    const strategy = factory(error);

    // Find the most relevant affected file for this error
    const file =
      diagnosis.affectedFiles.length > 0
        ? diagnosis.affectedFiles[0]
        : null;

    proposals.push({
      patchId:     `PATCH-${error.errorId}-${proposals.length + 1}`,
      priority:    strategy.priority,
      targetError: error.errorId,
      file,
      action:      strategy.action,
      description: strategy.description,
      suggestion:  strategy.suggestion,
      automated:   strategy.automated
    });

  }

  // Sort: critical errors first, then by priority weight
  proposals.sort((a, b) =>
    (PRIORITY_WEIGHT[a.priority] ?? 9) -
    (PRIORITY_WEIGHT[b.priority] ?? 9)
  );

  return proposals;

}
