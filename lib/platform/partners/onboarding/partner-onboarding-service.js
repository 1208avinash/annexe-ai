export default class PartnerOnboardingService {
  build(input = {}) {
    const partner = input.partner ?? null;

    return {
      onboardingId: `ONB-${Date.now()}`,
      partnerId: partner?.id ?? null,
      status: partner ? "READY" : "PENDING",
      steps: [
        "Create partner profile",
        "Verify branding",
        "Assign commission plan",
        "Enable customer onboarding",
        "Connect sales and revenue tracking"
      ],
      onboardingCompleted: Boolean(partner)
    };
  }
}
