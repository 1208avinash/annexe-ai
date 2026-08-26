import BrandingService from "./branding-service.js";
import DomainManager from "./domain-manager.js";
import TenantBrandingService from "./tenant-branding-service.js";

export default class WhiteLabelManager {
  constructor({
    brandingService = new BrandingService(),
    domainManager = new DomainManager(),
    tenantBrandingService = new TenantBrandingService()
  } = {}) {
    this.brandingService = brandingService;
    this.domainManager = domainManager;
    this.tenantBrandingService = tenantBrandingService;
  }

  build(input = {}) {
    const branding = this.brandingService.build(input);
    const domain = this.domainManager.build({ branding });
    const tenantBranding = this.tenantBrandingService.build({
      branding: {
        ...branding,
        domain: domain.domain
      }
    });

    return {
      branding,
      domain,
      tenantBranding,
      whiteLabelReadiness: 100
    };
  }
}
