function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default class PartnerManagementService {
  build(input = {}) {
    const partners = (input.partners ?? [
      {
        companyName: "ABC Digital",
        contactPerson: "Ava Carter",
        email: "partners@abcdigital.ai",
        type: "Agency Partner",
        commissionPlan: { productSale: 30, upgrade: 20, subscription: 15 }
      },
      {
        companyName: "Northstar Consulting",
        contactPerson: "Noah Reed",
        email: "hello@northstarconsulting.ai",
        type: "Consultant Partner",
        commissionPlan: { productSale: 30, upgrade: 20, subscription: 15 }
      }
    ]).map((partner, index) => ({
      id: partner.id ?? `partner-${index + 1}`,
      companyName: partner.companyName,
      contactPerson: partner.contactPerson,
      email: partner.email,
      type: partner.type,
      status: partner.status ?? "active",
      commissionPlan: partner.commissionPlan ?? { productSale: 30, upgrade: 20, subscription: 15 },
      branding: partner.branding ?? {
        companyName: partner.companyName,
        domain: `${slugify(partner.companyName)}.annexe.ai`
      }
    }));

    return {
      partnerCount: partners.length,
      partners,
      partnerTypes: Array.from(new Set(partners.map(partner => partner.type))),
      activePartners: partners.filter(partner => partner.status === "active").length
    };
  }
}
