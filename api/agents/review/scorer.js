/*
  ANNEXE AI — Code Review Agent
  FILE: api/agents/review/scorer.js

  Scoring Engine
  Calculates a quality score from detected issues
  and returns a review decision.
*/


/*
  Severity deduction map
*/

const SEVERITY_DEDUCTIONS = {
  CRITICAL: 30,
  HIGH:     20,
  MEDIUM:   10,
  LOW:       5
};


/*
  Decision thresholds
*/

const DECISION_THRESHOLDS = {
  APPROVED:              90,
  APPROVED_WITH_CHANGES: 70
};


/*
  calculateScore(issues)

  Accepts an array of issue objects: [{ severity: "HIGH", ... }]
  Returns: { score, decision }
*/

export function calculateScore(issues = []) {

  let score = 100;


  for (const issue of issues) {

    const deduction =
      SEVERITY_DEDUCTIONS[issue.severity] || 0;

    score -= deduction;

  }


  // Floor at 0
  score = Math.max(0, score);


  let decision;

  if (score >= DECISION_THRESHOLDS.APPROVED) {
    decision = "APPROVED";
  }
  else if (score >= DECISION_THRESHOLDS.APPROVED_WITH_CHANGES) {
    decision = "APPROVED_WITH_CHANGES";
  }
  else {
    decision = "REJECTED";
  }


  return {
    score,
    decision
  };

}
