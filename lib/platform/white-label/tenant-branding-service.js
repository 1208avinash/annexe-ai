import BrandingService from "./branding-service.js";
import DomainManager from "./domain-manager.js";

export default class TenantBrandingService {
  constructor({
    brandingService = new BrandingService(),
    domainManager = new DomainManager()
  } = {}) {
    this.brandingService = brandingService;
    this.domainManager = domainManager;
  }

  build(input = {}) {
    const branding = this.brandingService.build(input);
    const domain = this.domainManager.build({
      branding,
      companyName: branding.companyName
    });

    return {
      branding,
      domain,
      whiteLabelReady: true,
      poweredBy: "ANNEXE AI"
    };
  }
}
