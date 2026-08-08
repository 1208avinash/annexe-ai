export function createEngineeringPlan(data = {}) {
  return {
    engineeringId:    data.engineeringId    || "ENG-" + Date.now(),
    projectId:        data.projectId        || null,
    projectName:      data.projectName      || null,
    status:           data.status           || "planning",
    teams: {
      frontend: data.teams?.frontend || [],
      backend:  data.teams?.backend  || [],
      database: data.teams?.database || [],
      ai:       data.teams?.ai       || [],
      devops:   data.teams?.devops   || []
    },
    developmentOrder: data.developmentOrder || [],
    dependencies:     data.dependencies     || [],
    risks:            data.risks            || [],
    createdAt:        data.createdAt        || new Date().toISOString()
  };
}