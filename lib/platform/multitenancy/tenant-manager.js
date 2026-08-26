import TenantIsolation from "./tenant-isolation.js";
import TenantResourceManager from "./tenant-resource-manager.js";

export default class TenantManager {
  constructor({ resourceManager = new TenantResourceManager(), isolation = new TenantIsolation() } = {}) {
    this.resourceManager = resourceManager;
    this.isolation = isolation;
  }

  evaluate(organization, projectCount = 0) {
    return {
      isolation: this.isolation.isolate(organization),
      resources: this.resourceManager.evaluateUsage({ projectCount })
    };
  }
}
