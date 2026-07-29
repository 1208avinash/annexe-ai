/*
  ANNEXE AI — Repository Manager
  FILE: api/repository/commit.js

  Commit Generator
  Builds conventional commit messages from task metadata.
  In-memory only. No git commands. No GitHub API.
*/


/*
  Valid conventional commit types
*/

const COMMIT_TYPES = [
  "feat",
  "fix",
  "refactor",
  "test",
  "docs",
  "security"
];


/*
  Default type when none is provided or type is unrecognised
*/

const DEFAULT_TYPE = "feat";


/*
  In-memory commit store
*/

const commitStore = [];


/*
  buildCommitMessage(type, scope, description)

  Produces a conventional commit message string.
  Format: type(scope): description
*/

function buildCommitMessage(type, scope, description) {

  const safeType  =
    COMMIT_TYPES.includes(type) ? type : DEFAULT_TYPE;

  const safeScope =
    scope
      ? scope
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "")
      : "core";

  const safeDesc  =
    description
      ? description.trim()
      : "automated update";


  return `${safeType}(${safeScope}): ${safeDesc}`;

}


/*
  CommitManager

  Generates and stores commit records for ANNEXE AI tasks.
*/

export class CommitManager {


  /*
    createCommit(data)

    Input:
    {
      task:  { id, name, ... },
      files: [{ name, ... }],
      type:  "feat" | "fix" | "refactor" | "test" | "docs" | "security"
    }

    Returns:
    {
      success: true,
      commit: {
        id:           "CMT-...",
        message:      "feat(task-name): ...",
        filesChanged: [...],
        status:       "CREATED"
      }
    }
  */

  createCommit(data = {}) {

    try {

      const { task, files, type } = data;


      if (!task) {
        return {
          success: false,
          error:   "Field 'task' is required"
        };
      }

      if (!Array.isArray(files) || files.length === 0) {
        return {
          success: false,
          error:   "Field 'files' must be a non-empty array"
        };
      }


      // Derive scope from task name or id
      const scope =
        task.name || task.id || "update";

      // Derive description from task
      const description =
        task.description ||
        `implement ${scope}`;

      const message = buildCommitMessage(
        type,
        scope,
        description
      );

      const filesChanged = files.map(f => f.name || "unnamed");


      const commit = {
        id:           "CMT-" + Date.now(),
        message,
        filesChanged,
        taskId:       task.id   || null,
        taskName:     task.name || null,
        status:       "CREATED",
        createdAt:    new Date().toISOString()
      };


      commitStore.push(commit);


      console.log(
        "ANNEXE COMMIT MANAGER — Commit created:",
        commit.id,
        message
      );


      return {
        success: true,
        commit: {
          id:           commit.id,
          message:      commit.message,
          filesChanged: commit.filesChanged,
          status:       commit.status
        }
      };

    }

    catch (error) {

      console.error(
        "ANNEXE COMMIT MANAGER — Error:",
        error
      );

      return {
        success: false,
        error:   "Commit generation failed",
        message: error.message
      };

    }

  }


  /*
    getCommits()

    Returns all commits stored in memory.
  */

  getCommits() {
    return commitStore;
  }

}
