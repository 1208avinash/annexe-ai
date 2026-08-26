function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createProduct(definition) {
  return {
    id: slugify(definition.name),
    name: definition.name,
    category: definition.category,
    description: definition.description,
    industry: definition.industry,
    features: definition.features,
    pricing: definition.pricing,
    deploymentType: definition.deploymentType,
    subscriptionPlan: definition.subscriptionPlan,
    upgradeAvailable: true
  };
}

export default class ProductCatalogService {
  buildCatalog(input = {}) {
    const products = [
      createProduct({
        name: "AI CRM Platform",
        category: "business-system",
        description: "Customer management, lead tracking, AI sales assistant, and analytics.",
        industry: "Sales",
        features: ["customer management", "lead tracking", "AI sales assistant", "analytics"],
        pricing: { setup: 5000, subscription: 299, upgrade: 999, currency: "USD" },
        deploymentType: "Managed SaaS",
        subscriptionPlan: "Monthly subscription with upgrade path"
      }),
      createProduct({
        name: "AI ERP Platform",
        category: "business-system",
        description: "Finance, inventory, operations, and reporting in one platform.",
        industry: "Operations",
        features: ["finance", "inventory", "operations", "reporting"],
        pricing: { setup: 7500, subscription: 499, upgrade: 1499, currency: "USD" },
        deploymentType: "Managed SaaS",
        subscriptionPlan: "Monthly subscription with enterprise upgrade"
      }),
      createProduct({
        name: "AI HRMS Platform",
        category: "business-system",
        description: "Employee management, recruitment, payroll, and workforce tracking.",
        industry: "Human Resources",
        features: ["employee management", "recruitment", "payroll"],
        pricing: { setup: 4500, subscription: 249, upgrade: 899, currency: "USD" },
        deploymentType: "Managed SaaS",
        subscriptionPlan: "Monthly subscription with workflow upgrades"
      }),
      createProduct({
        name: "AI Hospital Platform",
        category: "business-system",
        description: "Patient management, appointments, records, and clinical coordination.",
        industry: "Healthcare",
        features: ["patient management", "appointments", "records"],
        pricing: { setup: 9000, subscription: 699, upgrade: 1999, currency: "USD" },
        deploymentType: "Managed SaaS",
        subscriptionPlan: "Monthly subscription with compliance upgrades"
      }),
      createProduct({
        name: "AI School Platform",
        category: "business-system",
        description: "Students, teachers, administration, and academic operations.",
        industry: "Education",
        features: ["students", "teachers", "administration"],
        pricing: { setup: 4000, subscription: 199, upgrade: 699, currency: "USD" },
        deploymentType: "Managed SaaS",
        subscriptionPlan: "Monthly subscription with campus upgrade packs"
      }),
      createProduct({
        name: "AI Marketplace Platform",
        category: "business-system",
        description: "Sellers, products, payments, and commerce operations.",
        industry: "Commerce",
        features: ["sellers", "products", "payments"],
        pricing: { setup: 8500, subscription: 599, upgrade: 1899, currency: "USD" },
        deploymentType: "Managed SaaS",
        subscriptionPlan: "Monthly subscription with commerce expansion"
      }),
      createProduct({
        name: "AI Sales Agent",
        category: "agent",
        description: "Qualifies leads, writes follow-ups, and advances sales opportunities.",
        industry: "Sales",
        features: ["lead qualification", "follow-up drafting", "sales intelligence"],
        pricing: { setup: 1500, subscription: 99, upgrade: 399, currency: "USD" },
        deploymentType: "API + SaaS",
        subscriptionPlan: "Subscription with sales workflow upgrades"
      }),
      createProduct({
        name: "AI Customer Support Agent",
        category: "agent",
        description: "Answers tickets, routes issues, and improves support coverage.",
        industry: "Support",
        features: ["ticket handling", "issue routing", "support insights"],
        pricing: { setup: 1500, subscription: 99, upgrade: 399, currency: "USD" },
        deploymentType: "API + SaaS",
        subscriptionPlan: "Subscription with support automation packs"
      }),
      createProduct({
        name: "AI Marketing Agent",
        category: "agent",
        description: "Generates campaigns, content, and performance recommendations.",
        industry: "Marketing",
        features: ["campaign planning", "content generation", "performance analytics"],
        pricing: { setup: 1800, subscription: 129, upgrade: 499, currency: "USD" },
        deploymentType: "API + SaaS",
        subscriptionPlan: "Subscription with growth automation"
      }),
      createProduct({
        name: "AI Finance Agent",
        category: "agent",
        description: "Supports cash flow, invoices, revenue forecasting, and finance ops.",
        industry: "Finance",
        features: ["cash flow", "invoices", "forecasting"],
        pricing: { setup: 2000, subscription: 149, upgrade: 599, currency: "USD" },
        deploymentType: "API + SaaS",
        subscriptionPlan: "Subscription with finance automation"
      }),
      createProduct({
        name: "AI HR Agent",
        category: "agent",
        description: "Helps with hiring, onboarding, and workforce administration.",
        industry: "Human Resources",
        features: ["hiring", "onboarding", "workforce administration"],
        pricing: { setup: 1800, subscription: 129, upgrade: 499, currency: "USD" },
        deploymentType: "API + SaaS",
        subscriptionPlan: "Subscription with people operations packs"
      }),
      createProduct({
        name: "AI Analytics Agent",
        category: "agent",
        description: "Tracks metrics, surfaces insights, and recommends optimizations.",
        industry: "Analytics",
        features: ["dashboards", "forecasting", "optimization recommendations"],
        pricing: { setup: 2200, subscription: 159, upgrade: 699, currency: "USD" },
        deploymentType: "API + SaaS",
        subscriptionPlan: "Subscription with analytics evolution"
      })
    ];

    return {
      catalogId: `MP-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      marketplaceName: input.marketplaceName ?? "ANNEXE AI Marketplace",
      products,
      categories: Array.from(new Set(products.map(product => product.category))),
      deploymentTypes: Array.from(new Set(products.map(product => product.deploymentType))),
      subscriptionModes: ["One-time purchase", "Subscription", "Upgrade plan"],
      productCount: products.length,
      activeProducts: products.length,
      revenueModels: [
        "one-time setup",
        "monthly subscription",
        "paid upgrade"
      ]
    };
  }
}
