export default class CommissionService {
  build(input = {}) {
    const sales = input.sales ?? {};
    const subscriptionRevenue = Number(sales.subscriptionRevenue ?? 0);
    const productRevenue = Number(sales.productRevenue ?? 0);
    const upgradeRevenue = Number(sales.upgradeRevenue ?? 0);
    const productCommissionRate = 0.3;
    const upgradeCommissionRate = 0.2;
    const subscriptionCommissionRate = 0.15;

    const productCommission = Math.round(productRevenue * productCommissionRate);
    const upgradeCommission = Math.round(upgradeRevenue * upgradeCommissionRate);
    const subscriptionCommission = Math.round(subscriptionRevenue * subscriptionCommissionRate);
    const totalCommission = productCommission + upgradeCommission + subscriptionCommission;

    return {
      commissionReportId: `COM-${Date.now()}`,
      productCommissionRate: 30,
      upgradeCommissionRate: 20,
      subscriptionCommissionRate: 15,
      productCommission,
      upgradeCommission,
      subscriptionCommission,
      totalCommission,
      status: "READY"
    };
  }
}
