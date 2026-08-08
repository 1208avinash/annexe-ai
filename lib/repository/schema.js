export function createRepositoryReport(data = {}) {
  return {
    repositoryId:     data.repositoryId     || "REPO-" + Date.now(),
    projectId:        data.projectId        || null,
    repositoryUrl:    data.repositoryUrl    || null,
    projectType:      data.projectType      || "existing",
    technologyStack:  data.technologyStack  || {},
    frontend:         data.frontend         || null,
    backend:          data.backend          || null,
    database:         data.database         || null,
    architecture:     data.architecture     || "unknown",
    dependencies:     data.dependencies     || [],
    securityIssues:   data.securityIssues   || [],
    performanceIssues:data.performanceIssues|| [],
    improvementPlan:  data.improvementPlan  || [],
    analyzedAt:       data.analyzedAt       || new Date().toISOString()
  };
}