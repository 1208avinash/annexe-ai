/*
  ANNEXE AI — Code Review Agent
  FILE: api/agents/review/validator.js

  Review Request Validator
  Ensures incoming review requests contain
  all required fields before processing begins.
*/


/*
  Required top-level fields for a valid review request
*/

const REQUIRED_FIELDS = [
  "task",
  "files",
  "tests",
  "architecture"
];


/*
  validateReviewRequest(request)

  Validates that a review request contains all required fields.
  Returns: { valid: boolean, errors: string[] }
*/

export function validateReviewRequest(request) {

  const errors = [];


  if (!request || typeof request !== "object") {
    return {
      valid: false,
      errors: ["Review request must be a valid object"]
    };
  }


  for (const field of REQUIRED_FIELDS) {

    if (
      request[field] === undefined ||
      request[field] === null ||
      request[field] === ""
    ) {
      errors.push(`Missing required field: ${field}`);
    }

  }


  // files must be a non-empty array
  if (
    request.files !== undefined &&
    (!Array.isArray(request.files) || request.files.length === 0)
  ) {
    errors.push("Field 'files' must be a non-empty array");
  }


  return {
    valid:  errors.length === 0,
    errors
  };

}
