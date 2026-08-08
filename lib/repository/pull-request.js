/*
  ANNEXE AI — Repository Manager
  FILE: api/repository/pull-request.js

  Pull Request Manager
  Creates and stores pull request records in memory.
  In-memory only. No git commands. No GitHub API.
*/


/*
  In-memory PR store
*/

const pullRequestStore = [];


/*
  generatePRId()

  Produces a unique pull request identifier.
*/

function generatePRId() {
  return "PR-" + Date.now();
}


/*
  buildPRDescription(data)

  Assembles a structured PR description from input data.
*/

function buildPRDescription(data) {

  const lines = [];


  if (data.description) {
    lines.push(data.description);
    lines.push("");
  }


  if (Array.isArray(data.changes) && data.changes.length) {
    lines.push("## Changes");
    for (const change of data.changes) {
      lines.push(`- ${change}`);
    }
    lines.push("");
  }


  if (data.tests) {
    lines.push("## Test Status");
    lines.push(`Status: ${data.tests.status || "UNKNOWN"}`);

    if (data.tests.coverage !== undefined) {
      lines.push(`Coverage: ${data.tests.coverage}%`);
    }
    lines.push("");
  }


  if (data.review) {
    lines.push("## Code Review");
    lines.push(`Score: ${data.review.score ?? "N/A"}`);
    lines.push(`Decision: ${data.review.decision || "N/A"}`);
  }


  return lines.join("\n");

}


/*
  PullRequestManager

  Creates and retrieves pull request records for ANNEXE AI.
*/

export class PullRequestManager {


  /*
    createPullRequest(data)

    Input:
    {
      projectId:   string,
      branch:      string,
      title:       string,
      description: string,
      changes:     string[],
      tests:       { status, coverage },
      review:      { score, decision }
    }

    Returns:
    {
      success: true,
      pullRequest: {
        id:     "PR-...",
        status: "PENDING_REVIEW"
      }
    }
  */

  createPullRequest(data = {}) {

    try {

      const {
        projectId,
        branch,
        title,
        description,
        changes,
        tests,
        review
      } = data;


      if (!projectId) {
        return {
          success: false,
          error:   "Field 'projectId' is required"
        };
      }

      if (!branch) {
        return {
          success: false,
          error:   "Field 'branch' is required"
        };
      }

      if (!title) {
        return {
          success: false,
          error:   "Field 'title' is required"
        };
      }


      const id = generatePRId();

      const fullDescription = buildPRDescription({
        description,
        changes,
        tests,
        review
      });


      const pullRequest = {
        id,
        projectId,
        branch,
        title,
        description:  fullDescription,
        changes:      changes  || [],
        tests:        tests    || null,
        review:       review   || null,
        status:       "PENDING_REVIEW",
        createdAt:    new Date().toISOString()
      };


      pullRequestStore.push(pullRequest);


      console.log(
        "ANNEXE PULL REQUEST MANAGER — PR created:",
        id,
        title
      );


      return {
        success: true,
        pullRequest: {
          id,
          status: "PENDING_REVIEW"
        }
      };

    }

    catch (error) {

      console.error(
        "ANNEXE PULL REQUEST MANAGER — Error:",
        error
      );

      return {
        success: false,
        error:   "Pull request creation failed",
        message: error.message
      };

    }

  }


  /*
    getPullRequests()

    Returns all pull requests stored in memory.
  */

  getPullRequests() {
    return pullRequestStore;
  }

}
