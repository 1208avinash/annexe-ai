/*
  ANNEXE AI — Repository Manager
  FILE: api/repository/branch.js

  Branch Manager
  Handles branch name generation and validation.
  In-memory only. No git commands. No GitHub API.
*/


/*
  Protected branch names that must never be targeted
*/

const PROTECTED_BRANCHES = [
  "main",
  "master",
  "production"
];


/*
  In-memory branch store
*/

const branchStore = [];


/*
  validateBranchName(branch)

  Ensures a branch name is safe to use.
  Returns: { valid: boolean, errors: string[] }
*/

export function validateBranchName(branch) {

  const errors = [];


  if (!branch || typeof branch !== "string") {
    errors.push("Branch name must be a non-empty string");
    return { valid: false, errors };
  }


  const normalised = branch.toLowerCase().trim();


  for (const protected_ of PROTECTED_BRANCHES) {

    if (
      normalised === protected_ ||
      normalised.endsWith("/" + protected_)
    ) {
      errors.push(
        `Branch name '${branch}' targets a protected branch: ${protected_}`
      );
    }

  }


  // Basic naming safety — no spaces, no special chars beyond / - _
  if (/[^a-zA-Z0-9/_\-.]/.test(branch)) {
    errors.push(
      "Branch name contains invalid characters (allowed: a-z, A-Z, 0-9, / - _ .)"
    );
  }


  return {
    valid:  errors.length === 0,
    errors
  };

}


/*
  BranchManager

  Creates and tracks feature branches for ANNEXE AI tasks.
*/

export class BranchManager {


  /*
    createBranch(projectId, taskId)

    Generates a namespaced branch name and records it in memory.

    Returns:
    {
      success: true,
      branch:  "annexe-ai/{projectId}/{taskId}",
      status:  "CREATED"
    }
  */

  createBranch(projectId, taskId) {

    try {

      if (!projectId || !taskId) {
        return {
          success: false,
          error:   "projectId and taskId are required"
        };
      }


      const branch =
        `annexe-ai/${projectId}/${taskId}`;


      // Validate before storing
      const validation = validateBranchName(branch);

      if (!validation.valid) {
        return {
          success: false,
          error:   "Branch name validation failed",
          details: validation.errors
        };
      }


      const record = {
        branch,
        projectId,
        taskId,
        status:    "CREATED",
        createdAt: new Date().toISOString()
      };


      branchStore.push(record);


      console.log(
        "ANNEXE BRANCH MANAGER — Branch created:",
        branch
      );


      return {
        success: true,
        branch,
        status:  "CREATED"
      };

    }

    catch (error) {

      console.error(
        "ANNEXE BRANCH MANAGER — Error:",
        error
      );

      return {
        success: false,
        error:   "Branch creation failed",
        message: error.message
      };

    }

  }


  /*
    getBranches()

    Returns all branches stored in memory.
  */

  getBranches() {
    return branchStore;
  }

}
