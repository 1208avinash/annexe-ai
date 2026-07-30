/*
  ANNEXE EXECUTION ENGINE
  logs.js

  Purpose:
  Convert raw command-runner output into structured execution logs.

  Responsibility:
  - Collect stdout as readable output
  - Extract error lines from stdout + stderr
  - Extract warning lines from stdout + stderr
  - Preserve command history

  Does NOT:
  - Execute commands
  - Modify files
  - Call debug worker
  - Call any external API
  - Make retry decisions
*/


/*
  Line-level classifiers.
  Patterns are intentionally broad to catch
  output from npm, node, compilers, and test runners.
*/

const ERROR_PATTERNS = [
  /\berror\b/i,
  /\bfailed\b/i,
  /\bfailure\b/i,
  /\bexception\b/i,
  /\buncaught\b/i,
  /\bcannot find\b/i,
  /\bcould not\b/i,
  /\bnot found\b/i,
  /\bERR!/i,
  /\bSyntaxError\b/,
  /\bTypeError\b/,
  /\bReferenceError\b/,
  /\bRangeError\b/,
  /\bEACCES\b/,
  /\bENOENT\b/,
  /\bEADDRINUSE\b/
];

const WARNING_PATTERNS = [
  /\bwarn\b/i,
  /\bwarning\b/i,
  /\bdeprecated\b/i,
  /\bdeprecation\b/i,
  /\bobsolete\b/i,
  /\bskipping\b/i,
  /\bfallback\b/i
];


function classifyLines(text = "") {

  const errors = [];
  const warnings = [];

  const lines = text
    .split("\n")
    .map(l => l.trimEnd())
    .filter(l => l.length > 0);

  for (const line of lines) {

    const isError = ERROR_PATTERNS.some(p => p.test(line));

    if (isError) {
      errors.push(line);
      continue;
    }

    const isWarning = WARNING_PATTERNS.some(p => p.test(line));

    if (isWarning) {
      warnings.push(line);
    }

  }

  return { errors, warnings };

}


export function processLogs({
  commandResult = {}
} = {}) {


  const {
    success = false,
    command = null,
    stdout = "",
    stderr = "",
    exitCode = null,
    error = null
  } = commandResult;


  // Combine stdout + stderr for full classification pass
  const combinedOutput = [stdout, stderr]
    .filter(Boolean)
    .join("\n");

  const { errors: stdoutErrors, warnings: stdoutWarnings } =
    classifyLines(stdout);

  const { errors: stderrErrors, warnings: stderrWarnings } =
    classifyLines(stderr);


  // Merge, deduplicate
  const allErrors = [
    ...new Set([...stdoutErrors, ...stderrErrors])
  ];

  const allWarnings = [
    ...new Set([...stdoutWarnings, ...stderrWarnings])
  ];


  // If runner itself reported a top-level error message,
  // include it unless it duplicates an extracted line
  if (error && !allErrors.includes(error)) {
    allErrors.push(error);
  }


  // Readable output: stdout primary, stderr appended if present
  const output = combinedOutput.trim();


  // Command history — filter nulls
  const commands = command ? [command] : [];


  return {
    success,
    exitCode,
    errors: allErrors,
    warnings: allWarnings,
    output,
    commands
  };

}


export default processLogs;
