export default class DomainManager {
  build(input = {}) {
    const companyName = String(input.branding?.companyName ?? input.companyName ?? "annexe-ai").toLowerCase();
    const slug = companyName.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    return {
      domain: input.branding?.domain ?? `${slug}.annexe.ai`,
      customDomainEnabled: true,
      emailDomain: input.branding?.emailDomain ?? `mail.${slug}.annexe.ai`,
      sslEnabled: true
    };
  }
}
