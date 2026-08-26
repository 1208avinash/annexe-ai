export default class TenantResourceManager {
  constructor({ maxProjectsPerTenant = 1000 } = {}) {
    this.maxProjectsPerTenant = maxProjectsPerTenant;
  }

  evaluateUsage({ projectCount = 0 } = {}) {
    return {
      projectCount,
      maxProjectsPerTenant: this.maxProjectsPerTenant,
      withinLimits: projectCount <= this.maxProjectsPerTenant
    };
  }
}
