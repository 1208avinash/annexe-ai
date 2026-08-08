/*
  ANNEXE AI — Code Review Agent
  FILE: api/agents/review/reviewer.js

  CodeReviewAgent
  Orchestrates deterministic rule-based code review.
  No external LLM calls. No filesystem writes.
  Future LLM review can replace internal analysis logic.
*/


import { validateReviewRequest } from "./validator.js";
import { getRules }              from "./rules.js";
import { calculateScore }        from "./scorer.js";


/*
  In-memory review store
  Persists reviews for the lifetime of the process.
*/

const reviewStore = [];


/*
  Patterns used for deterministic file analysis
*/

const SECURITY_PATTERNS = [

  {
    pattern:  /password\s*=/i,
    severity: "CRITICAL",
    type:     "SECURITY",
    message:  "Hardcoded secret detected: 'password' assignment"
  },

  {
    pattern:  /api_key\s*=/i,
    severity: "CRITICAL",
    type:     "SECURITY",
    message:  "Hardcoded secret detected: 'api_key' assignment"
  },

  {
    pattern:  /secret\s*=/i,
    severity: "CRITICAL",
    type:     "SECURITY",
    message:  "Hardcoded secret detected: 'secret' assignment"
  },

  {
    pattern:  /token\s*=\s*["'][^"']{8,}/i,
    severity: "CRITICAL",
    type:     "SECURITY",
    message:  "Hardcoded token value detected"
  },

  {
    pattern:  /\beval\s*\(/,
    severity: "HIGH",
    type:     "SECURITY",
    message:  "Unsafe operation detected: eval()"
  },

  {
    pattern:  /\bexec\s*\(/,
    severity: "HIGH",
    type:     "SECURITY",
    message:  "Unsafe operation detected: exec()"
  }

];


const QUALITY_PATTERNS = [

  {
    pattern:  /\bvar\s+[a-z]\b/,
    severity: "LOW",
    type:     "QUALITY",
    message:  "Single-character variable name detected — use descriptive names"
  },

  {
    pattern:  /if\s*\(.*\)\s*\{[^}]{200,}\}/s,
    severity: "LOW",
    type:     "QUALITY",
    message:  "Excessively complex conditional block detected"
  }

];


/*
  analyzeFile(file)

  Runs pattern matching against a single file's content.
  Returns an array of detected issues.
*/

function analyzeFile(file) {

  const issues = [];

  const content = file.content || "";
  const name    = file.name    || "unknown";


  for (const rule of SECURITY_PATTERNS) {

    if (rule.pattern.test(content)) {

      issues.push({
        severity: rule.severity,
        type:     rule.type,
        file:     name,
        message:  rule.message
      });

    }

  }


  for (const rule of QUALITY_PATTERNS) {

    if (rule.pattern.test(content)) {

      issues.push({
        severity: rule.severity,
        type:     rule.type,
        file:     name,
        message:  rule.message
      });

    }

  }


  return issues;

}


/*
  analyzeTests(tests)

  Checks test status and coverage signals.
  Returns an array of detected issues.
*/

function analyzeTests(tests) {

  const issues = [];


  if (!tests) {
    issues.push({
      severity: "HIGH",
      type:     "TESTING",
      file:     "tests",
      message:  "No test information provided"
    });
    return issues;
  }


  if (tests.status === "FAILED") {
    issues.push({
      severity: "HIGH",
      type:     "TESTING",
      file:     "tests",
      message:  "Test suite status is FAILED"
    });
  }


  if (
    tests.coverage !== undefined &&
    typeof tests.coverage === "number" &&
    tests.coverage < 60
  ) {
    issues.push({
      severity: "MEDIUM",
      type:     "TESTING",
      file:     "tests",
      message:  `Test coverage is low: ${tests.coverage}%`
    });
  }


  if (!tests.errorHandling) {
    issues.push({
      severity: "MEDIUM",
      type:     "TESTING",
      file:     "tests",
      message:  "Error handling coverage not confirmed"
    });
  }


  return issues;

}


/*
  buildSummary(decision, issues)

  Produces a human-readable review summary string.
*/

function buildSummary(decision, issues) {

  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  for (const issue of issues) {
    if (counts[issue.severity] !== undefined) {
      counts[issue.severity]++;
    }
  }

  const parts = [];

  if (counts.CRITICAL) parts.push(`${counts.CRITICAL} critical`);
  if (counts.HIGH)     parts.push(`${counts.HIGH} high`);
  if (counts.MEDIUM)   parts.push(`${counts.MEDIUM} medium`);
  if (counts.LOW)      parts.push(`${counts.LOW} low`);

  const issueText = parts.length
    ? `Issues detected: ${parts.join(", ")}.`
    : "No issues detected.";

  return `Review decision: ${decision}. ${issueText}`;

}


/*
  buildRecommendations(issues)

  Derives actionable recommendations from detected issues.
*/

function buildRecommendations(issues) {

  const seen = new Set();
  const recommendations = [];

  for (const issue of issues) {

    if (issue.type === "SECURITY" && !seen.has("SECURITY")) {
      recommendations.push(
        "Remove all hardcoded credentials and load sensitive values from environment variables."
      );
      seen.add("SECURITY");
    }

    if (issue.type === "TESTING" && !seen.has("TESTING")) {
      recommendations.push(
        "Ensure all modules include tests with error handling coverage."
      );
      seen.add("TESTING");
    }

    if (issue.type === "QUALITY" && !seen.has("QUALITY")) {
      recommendations.push(
        "Review naming conventions and reduce conditional complexity."
      );
      seen.add("QUALITY");
    }

  }

  return recommendations;

}


/*
  CodeReviewAgent

  Main agent class. Orchestrates the full review pipeline.
*/

export class CodeReviewAgent {


  /*
    reviewCode(request)

    Performs a complete rule-based code review.

    request shape:
    {
      task:         { id, name, ... },
      files:        [{ name, content }],
      tests:        { status, coverage, errorHandling },
      architecture: { ... }
    }
  */

  async reviewCode(request) {

    try {

      // 1. Validate request
      const validation = validateReviewRequest(request);

      if (!validation.valid) {
        return {
          success: false,
          error:   "Invalid review request",
          details: validation.errors
        };
      }


      // 2. Load review rules (logged for traceability)
      const allRules = getRules();

      console.log(
        "ANNEXE CODE REVIEW — Rules loaded:",
        Object.keys(allRules)
      );


      // 3. Analyze files
      const fileIssues = [];

      for (const file of request.files) {
        const detected = analyzeFile(file);
        fileIssues.push(...detected);
      }


      // 4. Analyze tests
      const testIssues = analyzeTests(request.tests);


      // 5. Aggregate issues
      const issues = [
        ...fileIssues,
        ...testIssues
      ];


      // 6. Calculate score and decision
      const { score, decision } = calculateScore(issues);

      const summary         = buildSummary(decision, issues);
      const recommendations = buildRecommendations(issues);


      const review = {
        success:         true,
        reviewId:        "REV-" + Date.now(),
        taskId:          request.task?.id || null,
        score,
        decision,
        summary,
        issues,
        recommendations,
        createdAt:       new Date().toISOString()
      };


      // Store in memory
      reviewStore.push(review);


      console.log(
        "ANNEXE CODE REVIEW — Complete:",
        review.reviewId,
        decision,
        score
      );


      return review;

    }

    catch (error) {

      console.error(
        "ANNEXE CODE REVIEW — Error:",
        error
      );

      return {
        success: false,
        error:   "Code review agent failed",
        message: error.message
      };

    }

  }


  /*
    getReviews()

    Returns all reviews stored in memory.
  */

  getReviews() {
    return reviewStore;
  }

}
