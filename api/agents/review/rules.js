/*
  ANNEXE AI — Code Review Agent
  FILE: api/agents/review/rules.js

  Review Rule Registry
  Defines all rule-based review criteria
  used by the CodeReviewAgent.
*/


export const REVIEW_RULES = {

  security: [

    {
      id: "SEC-001",
      severity: "CRITICAL",
      description: "No hardcoded secrets or credentials allowed"
    },

    {
      id: "SEC-002",
      severity: "HIGH",
      description: "User input must be validated before processing"
    },

    {
      id: "SEC-003",
      severity: "HIGH",
      description: "Avoid unsafe operations such as eval() or exec()"
    }

  ],


  quality: [

    {
      id: "QUA-001",
      severity: "MEDIUM",
      description: "Variable and function names must be readable and descriptive"
    },

    {
      id: "QUA-002",
      severity: "MEDIUM",
      description: "Code structure must remain maintainable and modular"
    },

    {
      id: "QUA-003",
      severity: "LOW",
      description: "Avoid excessive complexity and deeply nested logic"
    }

  ],


  architecture: [

    {
      id: "ARC-001",
      severity: "HIGH",
      description: "Technology decisions from the intelligence agent must be respected"
    },

    {
      id: "ARC-002",
      severity: "MEDIUM",
      description: "Project folder structure must be followed"
    }

  ],


  testing: [

    {
      id: "TST-001",
      severity: "HIGH",
      description: "Tests must be included for each generated module"
    },

    {
      id: "TST-002",
      severity: "MEDIUM",
      description: "Error handling must be covered by tests"
    }

  ]

};


/*
  getRules(category)

  Returns rules for a given category.
  If no category is provided, all rules are returned.
*/

export function getRules(category) {

  if (!category) {
    return REVIEW_RULES;
  }

  const normalised = category.toLowerCase();

  if (!REVIEW_RULES[normalised]) {
    return [];
  }

  return REVIEW_RULES[normalised];

}
