/*
  ANNEXE DEBUG WORKER — ANALYZER
  ================================
  WHY THIS FILE EXISTS:
  Isolated parsing layer so diagnosis logic can be tested
  independently from the worker entry point and patch logic.

  V1 CONTRACT:
  - Input:  { errorLogs, buildReport, generatedFiles }
  - Output: diagnosis object (no file writes, read-only)

  ERROR CLASSIFICATION STRATEGY:
  We classify by SOURCE first (build | runtime | lint | test | dependency),
  then by SEVERITY (critical | warning | info).
  This lets patcher.js make targeted repair proposals without
  re-parsing raw strings.
*/


/*
  PATTERN REGISTRY
  Each entry: { id, source, severity, pattern (RegExp), message }
  Patterns are tried in order — first match wins per log line.
*/
const ERROR_PATTERNS = [

  // ── DEPENDENCY ERRORS ──────────────────────────────────────
  {
    id:       "DEP_NOT_FOUND",
    source:   "dependency",
    severity: "critical",
    pattern:  /cannot find module ['"]([^'"]+)['"]/i,
    message:  (m) => `Missing module: ${m[1]}`
  },
  {
    id:       "DEP_VERSION_CONFLICT",
    source:   "dependency",
    severity: "critical",
    pattern:  /peer dep.*requires.*but none is installed|incompatible.*version/i,
    message:  () => "Peer dependency version conflict"
  },

  // ── SYNTAX / PARSE ERRORS ──────────────────────────────────
  {
    id:       "SYNTAX_ERROR",
    source:   "build",
    severity: "critical",
    pattern:  /syntaxerror|unexpected token|unexpected end of input/i,
    message:  () => "Syntax error in source file"
  },
  {
    id:       "IMPORT_ERROR",
    source:   "build",
    severity: "critical",
    pattern:  /does not provide an export named|named export .* not found/i,
    message:  (m) => `Bad import: ${m[0]}`
  },

  // ── TYPE ERRORS ────────────────────────────────────────────
  {
    id:       "TYPE_ERROR",
    source:   "build",
    severity: "critical",
    pattern:  /typeerror:|type error:/i,
    message:  () => "TypeError detected"
  },

  // ── BUILD / COMPILATION ────────────────────────────────────
  {
    id:       "BUILD_FAILED",
    source:   "build",
    severity: "critical",
    pattern:  /build failed|compilation failed|exit code [^0]/i,
    message:  () => "Build/compilation failed"
  },
  {
    id:       "UNDEFINED_VAR",
    source:   "build",
    severity: "critical",
    pattern:  /(\w+) is not defined/i,
    message:  (m) => `Undefined reference: ${m[1]}`
  },

  // ── LINT ───────────────────────────────────────────────────
  {
    id:       "LINT_ERROR",
    source:   "lint",
    severity: "warning",
    pattern:  /eslint|tslint|prettier.*error/i,
    message:  () => "Lint error"
  },

  // ── TEST FAILURES ──────────────────────────────────────────
  {
    id:       "TEST_FAILED",
    source:   "test",
    severity: "critical",
    pattern:  /\d+ (test|spec)s? failed|assertion.*failed|expected.*received/i,
    message:  (m) => `Test failure: ${m[0]}`
  },
  {
    id:       "TEST_TIMEOUT",
    source:   "test",
    severity: "warning",
    pattern:  /timeout.*exceeded|async.*timeout/i,
    message:  () => "Test timeout"
  },

  // ── RUNTIME ────────────────────────────────────────────────
  {
    id:       "RUNTIME_CRASH",
    source:   "runtime",
    severity: "critical",
    pattern:  /unhandled (promise )?rejection|uncaught exception|process exited/i,
    message:  () => "Runtime crash / unhandled rejection"
  },
  {
    id:       "NETWORK_ERROR",
    source:   "runtime",
    severity: "warning",
    pattern:  /econnrefused|enotfound|network.*error|fetch.*failed/i,
    message:  () => "Network / connection error"
  }

];


/*
  classifyLines
  Scans every line of raw log text against ERROR_PATTERNS.
  Returns array of matched error objects (deduplicated by id+line).
*/
function classifyLines(rawText) {

  if (!rawText || typeof rawText !== "string") return [];

  const lines   = rawText.split(/\r?\n/);
  const matches = [];
  const seen    = new Set();

  for (const [lineIndex, line] of lines.entries()) {

    for (const ep of ERROR_PATTERNS) {

      const m = line.match(ep.pattern);

      if (!m) continue;

      const key = `${ep.id}:${lineIndex}`;
      if (seen.has(key)) continue;
      seen.add(key);

      matches.push({
        errorId:  ep.id,
        source:   ep.source,
        severity: ep.severity,
        message:  ep.message(m),
        line:     lineIndex + 1,
        raw:      line.trim()
      });

    }

  }

  return matches;

}


/*
  extractAffectedFiles
  Heuristic: look for file paths in error output.
  Filters to only files that appear in generatedFiles list (if provided).
*/
function extractAffectedFiles(rawText, generatedFiles) {

  if (!rawText) return [];

  // Common path patterns: ./src/foo.js  /app/api/bar.ts  api/agents/x.js
  const pathRe = /(?:\.\/|\/)?(?:[\w-]+\/)*[\w-]+\.\w{1,6}/g;
  const found  = [...new Set(rawText.match(pathRe) || [])];

  if (!generatedFiles || generatedFiles.length === 0) {
    return found.slice(0, 10); // cap at 10 if no filter list
  }

  // Prefer files we know about from the build
  const knownSet = new Set(generatedFiles.map(f => f.replace(/^\.\//, "")));

  return found.filter(p => {
    const normalized = p.replace(/^\.\//, "");
    return knownSet.has(normalized);
  });

}


/*
  buildSummary
  Human-readable one-liner for the diagnosis block.
*/
function buildSummary(errors) {

  if (errors.length === 0) {
    return "No errors detected in provided logs.";
  }

  const critical = errors.filter(e => e.severity === "critical");
  const warnings = errors.filter(e => e.severity === "warning");

  const sources  = [...new Set(errors.map(e => e.source))];

  return (
    `Detected ${errors.length} issue(s): ` +
    `${critical.length} critical, ${warnings.length} warning(s). ` +
    `Sources: ${sources.join(", ")}.`
  );

}


/*
  analyze
  Main export. Pure function — no side effects, no file I/O.
*/
export function analyze({ errorLogs, buildReport, generatedFiles } = {}) {

  // Combine all text sources for pattern scanning
  const combinedText = [
    errorLogs    || "",
    buildReport  || ""
  ].join("\n");

  const errors        = classifyLines(combinedText);
  const affectedFiles = extractAffectedFiles(combinedText, generatedFiles);

  // Split by severity for quick access by patcher
  const criticalErrors = errors.filter(e => e.severity === "critical");
  const warnings       = errors.filter(e => e.severity === "warning");

  // Determine overall status
  const status =
    criticalErrors.length > 0 ? "critical" :
    warnings.length       > 0 ? "warnings" :
    "clean";

  return {

    status,

    summary: buildSummary(errors),

    errorCount: {
      total:    errors.length,
      critical: criticalErrors.length,
      warnings: warnings.length
    },

    errors,         // full list, ordered by line number
    affectedFiles,

    // Metadata for traceability
    analyzedAt: new Date().toISOString()

  };

}
