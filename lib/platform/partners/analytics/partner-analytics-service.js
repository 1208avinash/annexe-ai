export default class PartnerAnalyticsService {
  build(input = {}) {
    const customers = input.customers ?? [];
    const sales = input.sales ?? {};
    const commission = input.commission ?? {};

    return {
      analyticsId: `PAN-${Date.now()}`,
      activeCustomers: customers.filter(customer => customer.lifecycle === "active").length,
      productsSold: sales.conversions ?? 0,
      revenueGenerated: sales.revenue ?? 0,
      commissionsEarned: commission.totalCommission ?? 0,
      projectStatus: {
        active: customers.reduce((sum, customer) => sum + Number(customer.projects || 0), 0),
        delivered: customers.filter(customer => customer.lifecycle === "delivery").length
      },
      upgradeOpportunities: sales.conversions ? 1 : 0
    };
  }
}
