function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function scoreProduct(product, requestText) {
  const haystack = `${product.name} ${product.description} ${product.industry} ${product.features.join(" ")}`.toLowerCase();
  const text = String(requestText ?? "").toLowerCase();
  const keywords = text.split(/[^a-z0-9]+/g).filter(Boolean);

  let score = 0;
  for (const keyword of keywords) {
    if (haystack.includes(keyword)) {
      score += 10;
    }
  }

  return score;
}

export default class ProductManager {
  build(input = {}) {
    const catalog = input.catalog ?? { products: [] };
    const requestText = input.requestText ?? "";
    const rankedProducts = [...(catalog.products ?? [])]
      .map(product => ({ product, score: scoreProduct(product, requestText) }))
      .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name));

    const selected = rankedProducts[0]?.product ?? catalog.products?.[0] ?? null;

    return {
      managerId: `PM-${Date.now()}`,
      selectedProduct: selected,
      selectedProductId: selected?.id ?? null,
      featuredProduct: catalog.products?.find(product => product.name === "AI CRM Platform") ?? selected,
      recommendedProducts: rankedProducts.slice(0, 3).map(entry => entry.product),
      purchaseFlow: [
        "Browse Marketplace",
        "Select Product",
        "View Features",
        "View Pricing",
        "Purchase",
        "Payment",
        "Deployment",
        "Project Created",
        "Command Center Tracking",
        "Upgrade Options"
      ],
      purchaseSummary: selected
        ? {
            productId: selected.id,
            productName: selected.name,
            setupPrice: selected.pricing?.setup ?? 0,
            subscriptionPrice: selected.pricing?.subscription ?? 0,
            upgradePrice: selected.pricing?.upgrade ?? 0,
            paymentStructure: "50% advance / 50% completion",
            customerType: input.customerType ?? "Enterprise"
          }
        : null,
      browsePath: `/marketplace/${slugify(selected?.name ?? "products")}`
    };
  }
}
