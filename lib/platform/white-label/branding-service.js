export default class BrandingService {
  build(input = {}) {
    const brandName = input.branding?.companyName ?? input.companyName ?? "ANNEXE AI";

    return {
      logo: input.branding?.logo ?? null,
      colors: input.branding?.colors ?? {
        primary: "#111827",
        secondary: "#2563eb",
        accent: "#f59e0b"
      },
      companyName: brandName,
      tagline: input.branding?.tagline ?? "Powered by ANNEXE AI",
      emailBranding: input.branding?.emailBranding ?? `${brandName} Notifications`,
      customerPortalBranding: input.branding?.customerPortalBranding ?? `${brandName} Customer Portal`
    };
  }
}
