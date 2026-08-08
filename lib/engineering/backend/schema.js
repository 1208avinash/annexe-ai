export function createBackendEngineeringPlan(data = {}) {
  return {
    backendId:           data.backendId           || "BE-" + Date.now(),
    projectId:           data.projectId           || null,
    framework:           data.framework           || null,
    services:            data.services            || [],
    apis:                data.apis                || [],
    databaseIntegration: data.databaseIntegration || [],
    authentication:      data.authentication      || [],
    integrations:        data.integrations        || [],
    securityTasks:       data.securityTasks       || [],
    testingPlan:         data.testingPlan         || [],
    estimatedTasks:      data.estimatedTasks      || [],
    createdAt:           data.createdAt           || new Date().toISOString()
  };
}