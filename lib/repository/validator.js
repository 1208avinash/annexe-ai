/*
  ANNEXE AI — Repository Manager
  FILE: api/repository/validator.js

  Repository Safety Validator
  Guards all repository actions against unsafe operations.
  In-memory only. No git commands. No GitHub API.
*/


/*
  Protected branches that must never be the target
  of automated write operations.
*/

const PROTECTED_BRANCHES = [
  "main",
  "master",
  "production"
];


/*
  validateRepositoryAction(action)

  Validates a proposed repository action against safety rules.

  action shape:
  {
    type:     "push" | "merge" | "create_branch" | "commit",
    branch:   string,
    approved: boolean   (required for merge actions)
  }

  Returns:
  {
    valid:  boolean,
    errors: string[]
  }
*/

export function validateRepositoryAction(action) {

  const errors = [];


  if (!action || typeof action !== "object") {
    return {
      valid:  false,
      errors: ["Repository action must be a valid object"]
    };
  }


  // Rule 1 — Reject actions targeting protected branches
  if (action.branch) {

    const normalised = action.branch.toLowerCase().trim();

    for (const protected_ of PROTECTED_BRANCHES) {

      if (
        normalised === protected_ ||
        normalised.endsWith("/" + protected_)
      ) {
        errors.push(
          `Action targets protected branch '${action.branch}' — operation rejected`
        );
      }

    }

  }


  // Rule 2 — Reject merge without explicit approval
  if (
    action.type &&
    action.type.toLowerCase() === "merge" &&
    !action.approved
  ) {
    errors.push(
      "Merge operations require explicit human approval (approved: true)"
    );
  }


  // Rule 3 — Action type must be recognised
  const ALLOWED_TYPES = [
    "push",
    "merge",
    "create_branch",
    "commit"
  ];

  if (
    action.type &&
    !ALLOWED_TYPES.includes(action.type.toLowerCase())
  ) {
    errors.push(
      `Unknown action type '${action.type}' — allowed: ${ALLOWED_TYPES.join(", ")}`
    );
  }


  return {
    valid:  errors.length === 0,
    errors
  };

}
