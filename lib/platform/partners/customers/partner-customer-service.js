export default class PartnerCustomerService {
  build(input = {}) {
    const partner = input.partner ?? null;
    const products = input.products ?? [];

    const customers = [
      {
        id: "partner-customer-1",
        companyName: "Summit Realty Group",
        lifecycle: "active",
        projects: 2,
        productsSold: [products[0]?.name ?? "AI CRM Platform"]
      },
      {
        id: "partner-customer-2",
        companyName: "BluePeak Health",
        lifecycle: "delivery",
        projects: 1,
        productsSold: [products[1]?.name ?? "AI Hospital Platform"]
      }
    ];

    return {
      partnerId: partner?.id ?? null,
      customers,
      customerCount: customers.length,
      managedProjects: customers.reduce((sum, customer) => sum + Number(customer.projects || 0), 0),
      lifecycleStages: ["lead", "customer registration", "project", "delivery", "revenue share"]
    };
  }
}
