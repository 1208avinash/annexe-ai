import { runRepositoryManagerAgent } from "./api/repository/manager.js";

const input = {
  repositoryUrl: "https://github.com/example/project",
  projectId:     "ANNEXE-123",
  taskName:      "Add AI CRM module",
  baseBranch:    "main"
};

function assert(label, condition, actual) {
  console.log(`${condition ? "✅" : "❌"}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — Repository Manager Agent Test");
console.log("══════════════════════════════════════════════════════════\n");

const result = runRepositoryManagerAgent(input);
const state  = result.repositoryState;
const pr     = state?.pullRequest;
const commit = state?.commits?.[0];

assert("success === true",             result.success === true,                            result.success);
assert("agent name correct",           result.agent === "repository_manager_agent",        result.agent);
assert("repositoryState exists",       !!state,                                            null);
assert("repositoryUrl preserved",      state.repositoryUrl === input.repositoryUrl,        state.repositoryUrl);
assert("baseBranch is main",           state.baseBranch === "main",                        state.baseBranch);
assert("workingBranch exists",         !!state.workingBranch,                              state.workingBranch);
assert("workingBranch is not main",    state.workingBranch !== "main",                     state.workingBranch);
assert("workingBranch is not master",  state.workingBranch !== "master",                   state.workingBranch);
assert("workingBranch has prefix",     state.workingBranch.startsWith("annexe-ai/"),       state.workingBranch);
assert("status is prepared",           state.status === "prepared",                        state.status);
assert("changes is array",             Array.isArray(state.changes),                       null);
assert("commits is array",             Array.isArray(state.commits) && state.commits.length > 0, state.commits?.length);
assert("commit message exists",        !!commit?.message,                                  commit?.message);
assert("commit status is pending",     commit?.status === "pending",                       commit?.status);
assert("pullRequest exists",           !!pr,                                               null);
assert("pr title exists",              !!pr?.title,                                        pr?.title);
assert("pr description exists",        !!pr?.description,                                  null);
assert("pr sourceBranch correct",      pr?.sourceBranch === state.workingBranch,           pr?.sourceBranch);
assert("pr targetBranch is main",      pr?.targetBranch === "main",                        pr?.targetBranch);
assert("reviewRequired === true",      pr?.reviewRequired === true,                        pr?.reviewRequired);
assert("mergeAllowed === false",       pr?.mergeAllowed === false,                         pr?.mergeAllowed);
assert("pr status is draft",           pr?.status === "draft",                             pr?.status);
assert("protectedBranchesRespected",   result._meta?.protectedBranchesRespected === true,  result._meta?.protectedBranchesRespected);

console.log("\n── Snapshot ──────────────────────────────────────────────");
console.log("  Working branch: ", state.workingBranch);
console.log("  PR title:       ", pr?.title);
console.log("  Review required:", pr?.reviewRequired);
console.log("  Merge allowed:  ", pr?.mergeAllowed);

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  REPOSITORY MANAGER TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");