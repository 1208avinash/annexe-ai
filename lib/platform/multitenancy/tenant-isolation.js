export default class TenantIsolation {
  isolate(organization = {}) {
    return {
      organizationId: organization.id || organization.organizationId || null,
      isolated: true,
      namespace: `tenant-${organization.id || organization.organizationId || "unknown"}`
    };
  }
}
