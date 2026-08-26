export default class PartnerSalesService {
  build(input = {}) {
    const products = input.products ?? [];
    const partner = input.partner ?? null;
    const selectedProducts = products.slice(0, 4);
    const leads = selectedProducts.length * 3 + 2;
    const proposals = selectedProducts.length * 2;
    const conversions = selectedProducts.length;
    const revenue = selectedProducts.reduce((sum, product) => sum + Number(product?.pricing?.setup ?? 0) + Number(product?.pricing?.subscription ?? 0) * 12, 0);

    return {
      partnerId: partner?.id ?? null,
      leads,
      proposals,
      conversions,
      revenue,
      productsSold: selectedProducts.map(product => product.name),
      salesChannels: [
        "Marketplace Products",
        "Custom Software Projects",
        "AI Agents",
        "Upgrade Packages"
      ],
      pipeline: {
        qualification: "READY",
        proposal: "READY",
        conversion: "READY"
      }
    };
  }
}
