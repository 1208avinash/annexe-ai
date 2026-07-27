export function createDatabaseEngineeringPlan(data = {}) {
  return {
    databaseId:        data.databaseId        || "DB-" + Date.now(),
    projectId:         data.projectId         || null,
    databaseType:      data.databaseType      || null,
    entities:          data.entities          || [],
    relationships:     data.relationships     || [],
    schemaTasks:       data.schemaTasks       || [],
    migrationPlan:     data.migrationPlan     || [],
    indexingStrategy:  data.indexingStrategy  || [],
    securityPlan:      data.securityPlan      || [],
    optimizationPlan:  data.optimizationPlan  || [],
    testingPlan:       data.testingPlan       || [],
    estimatedTasks:    data.estimatedTasks    || [],
    createdAt:         data.createdAt         || new Date().toISOString()
  };
}