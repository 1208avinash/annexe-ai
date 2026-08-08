// ── ANNEXE AI — Test Result Analyzer ─────────────────────────────────────────
//
// Analyzes test execution results and classifies issues for the Code Review Agent.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Issue classifiers ─────────────────────────────────────────────────────────
//
// Each classifier checks output/status text and returns a typed issue when matched.

const CLASSIFIERS = [

  {
    type:     "TEST_FAILURE",
    label:    "Test failed",
    test:     text => /\bFAILED?\b/i.test(text) || /\bfail\b/i.test(text),
    severity: "HIGH"
  },

  {
    type:     "DEPENDENCY_ERROR",
    label:    "Missing dependency",
    test:     text => /module not found/i.test(text)
                   || /cannot find module/i.test(text)
                   || /missing/i.test(text)
                   || /dependency/i.test(text),
    severity: "HIGH"
  },

  {
    type:     "IMPORT_ERROR",
    label:    "Import or module resolution error",
    test:     text => /import error/i.test(text)
                   || /importerror/i.test(text)
                   || /no module named/i.test(text),
    severity: "HIGH"
  },

  {
    type:     "SYNTAX_ERROR",
    label:    "Syntax error in generated code",
    test:     text => /syntax error/i.test(text)
                   || /syntaxerror/i.test(text)
                   || /unexpected token/i.test(text),
    severity: "HIGH"
  },

  {
    type:     "TYPE_ERROR",
    label:    "Type error detected",
    test:     text => /typeerror/i.test(text)
                   || /type error/i.test(text)
                   || /is not a function/i.test(text),
    severity: "MEDIUM"
  },

  {
    type:     "BUILD_ERROR",
    label:    "Build failed",
    test:     text => /build failed/i.test(text)
                   || /compilation failed/i.test(text),
    severity: "HIGH"
  },

  {
    type:     "LINT_ERROR",
    label:    "Linting issues found",
    test:     text => /lint/i.test(text) && /error/i.test(text),
    severity: "LOW"
  },

  {
    type:     "SCHEMA_ERROR",
    label:    "Database schema or migration issue",
    test:     text => /schema/i.test(text)
                   || /migration/i.test(text),
    severity: "MEDIUM"
  },

  {
    type:     "GENERAL_ERROR",
    label:    "General error detected",
    test:     text => /error/i.test(text),
    severity: "MEDIUM"
  }

];


// ── classifyText ──────────────────────────────────────────────────────────────

function classifyText(text) {
  for (const classifier of CLASSIFIERS) {
    if (classifier.test(text)) {
      return {
        type:     classifier.type,
        message:  classifier.label,
        severity: classifier.severity,
        excerpt:  text.slice(0, 200)
      };
    }
  }
  return null;
}


// ── analyzeResult ─────────────────────────────────────────────────────────────

/**
 * Analyzes a test execution result and returns a structured analysis report.
 *
 * @param {object} result  — { status, results: [{ command, status, output }] }
 * @returns {{ success: boolean, summary: string, issues: object[] }}
 */
export function analyzeResult(result) {

  if (!result || typeof result !== "object") {
    return {
      success: false,
      summary: "No result provided",
      issues:  []
    };
  }

  const commandResults = Array.isArray(result.results) ? result.results : [];
  const issues         = [];

  // ── Classify each failed command output ───────────────────────────────────

  for (const cmd of commandResults) {

    if (cmd.status !== "FAIL") continue;

    const text   = [cmd.output || "", cmd.command || ""].join(" ");
    const issue  = classifyText(text);

    if (issue) {
      issues.push({ ...issue, command: cmd.command });
    } else {
      // Fallback — unclassified failure
      issues.push({
        type:     "UNKNOWN_FAILURE",
        message:  "Unclassified test failure",
        severity: "MEDIUM",
        excerpt:  (cmd.output || "").slice(0, 200),
        command:  cmd.command
      });
    }

  }

  // ── Build summary ─────────────────────────────────────────────────────────

  const passed  = commandResults.filter(r => r.status === "PASS").length;
  const failed  = commandResults.filter(r => r.status === "FAIL").length;
  const total   = commandResults.length;

  const overallPassed = result.status === "PASSED" || failed === 0;

  const summary = total === 0
    ? "No commands were executed"
    : `${passed}/${total} command(s) passed${failed > 0 ? `, ${failed} failed` : ""}`;

  return {
    success: overallPassed,
    summary,
    issues
  };

}
