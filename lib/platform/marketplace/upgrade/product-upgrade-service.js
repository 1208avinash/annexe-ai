export default class ProductUpgradeService {
  build(input = {}) {
    const selectedProduct = input.selectedProduct ?? null;
    const evolutionCenter = input.company?.evolutionDepartment ?? {};
    const upgradeCenter = input.company?.upgradeDepartment ?? {};

    return {
      upgradeId: `UPG-${Date.now()}`,
      productId: selectedProduct?.id ?? null,
      upgradeAvailable: Boolean(selectedProduct?.upgradeAvailable),
      upgradePayments: {
        advance: 50,
        completion: 50
      },
      upgradeOptions: [
        "Premium deployment pack",
        "Advanced analytics pack",
        "Automation evolution pack",
        "Industry expansion pack"
      ],
      evolutionRoadmap: evolutionCenter.roadmap?.immediateImprovements ?? [],
      upgradeRequests: upgradeCenter.plan?.implementationPhases ?? [],
      recommendedNextStep: "Offer upgrade after deployment stabilization"
    };
  }
}
