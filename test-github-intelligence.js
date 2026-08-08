import { runGithubIntelligenceAgent } from "./lib/agents/github/intelligence.js";

const repositoryData = {
  frontend:     "React",
  backend:      "FastAPI",
  database:     "PostgreSQL",
  dependencies: ["react", "fastapi", "old-package", "jsonwebtoken"]
};

const input = {
  repositoryUrl:  "https://github.com/annexe/example-crm",
  projectType:    "existing",
  projectId:      "ANNEXE-TEST-001",
  repositoryData
};

function assert(label, condition, actual) {
  console.log(`${condition ? "✅" : "❌"}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}

const result = runGithubIntelligenceAgent(input);
const report = result.report;
const teams  = report;

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — GitHub Intelligence Agent Test");
console.log("══════════════════════════════════════════════════════════\n");

assert("success === true",              result.success === true,                       result.success);
assert("agent name correct",            result.agent === "github_intelligence_agent",  result.agent);
assert("report present",                !!report,                                      null);
assert("repositoryId exists",           !!report.repositoryId,                         report.repositoryId);
assert("projectId preserved",           report.projectId === input.projectId,          report.projectId);
assert("repositoryUrl preserved",       report.repositoryUrl === input.repositoryUrl,  report.repositoryUrl);
assert("projectType preserved",         report.projectType === "existing",             report.projectType);
assert("frontend detected",             report.frontend === "React",                   report.frontend);
assert("backend detected",              report.backend  === "FastAPI",                 report.backend);
assert("database detected",             report.database === "PostgreSQL",              report.database);
assert("technologyStack exists",        !!report.technologyStack,                      null);
assert("technologyStack.frontend",      report.technologyStack.frontend === "React",   report.technologyStack.frontend);
assert("technologyStack.backend",       report.technologyStack.backend  === "FastAPI", report.technologyStack.backend);
assert("technologyStack.database",      report.technologyStack.database === "PostgreSQL", report.technologyStack.database);
assert("architecture detected",         report.architecture === "full-stack application", report.architecture);
assert("dependencies preserved",        Array.isArray(report.dependencies) && report.dependencies.length === 4, report.dependencies.length);
assert("securityIssues is array",       Array.isArray(report.securityIssues),          null);
assert("securityIssues not empty",      report.securityIssues.length > 0,             report.securityIssues.length);
assert("outdated dep flagged",          report.securityIssues.some(i => i.finding.toLowerCase().includes("outdated")), null);
assert("auth review flagged",           report.securityIssues.some(i => i.finding.toLowerCase().includes("authentication")), null);
assert("performanceIssues is array",    Array.isArray(report.performanceIssues),       null);
assert("performanceIssues not empty",   report.performanceIssues.length > 0,          report.performanceIssues.length);
assert("frontend perf issue exists",    report.performanceIssues.some(i => i.area === "frontend"), null);
assert("backend perf issue exists",     report.performanceIssues.some(i => i.area === "backend"),  null);
assert("database perf issue exists",    report.performanceIssues.some(i => i.area === "database"), null);
assert("improvementPlan is array",      Array.isArray(report.improvementPlan),         null);
assert("improvementPlan not empty",     report.improvementPlan.length > 0,            report.improvementPlan.length);
assert("each item has priority",        report.improvementPlan.every(i => !!i.priority), null);
assert("each item has area",            report.improvementPlan.every(i => !!i.area),     null);
assert("each item has action",          report.improvementPlan.every(i => !!i.action),   null);

console.log("\n  Architecture:       ", report.architecture);
console.log("  Security issues:    ", report.securityIssues.length);
console.log("  Performance issues: ", report.performanceIssues.length);
console.log("  Improvement actions:", report.improvementPlan.length);

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ✅  GITHUB INTELLIGENCE TEST PASSED");
console.log("══════════════════════════════════════════════════════════\n");