function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default class ProductDeploymentService {
  build(input = {}) {
    const selectedProduct = input.selectedProduct ?? null;
    const deploymentId = `DEP-${Date.now()}`;
    const projectId = `${slugify(selectedProduct?.name ?? "marketplace-product")}-project`;
    const organization = input.company?.organization ?? {
      id: "customer-org",
      name: "Marketplace Customer Organization"
    };

    return {
      deploymentId,
      project: {
        projectId,
        name: selectedProduct?.name ?? "Marketplace Product",
        productId: selectedProduct?.id ?? null,
        category: selectedProduct?.category ?? null,
        deploymentType: selectedProduct?.deploymentType ?? "Managed SaaS",
        status: "READY",
        workspaceRoot: input.workspaceRoot ?? null,
        customerOrganizationId: organization.id
      },
      template: {
        type: selectedProduct?.category ?? "business-system",
        selected: selectedProduct?.name ?? "AI CRM Platform"
      },
      deploymentSteps: [
        "Create project",
        "Select template",
        "Initialize workspace",
        "Connect customer organization",
        "Start deployment tracking"
      ],
      tracking: {
        commandCenterEnabled: true,
        upgradeTrackingEnabled: true,
        evolutionTrackingEnabled: true
      },
      organization
    };
  }
}
