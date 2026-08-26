export default class CustomerPaymentService {
    build(input = {}) {
        const estimatedCost = input.company?.estimation?.estimation?.estimatedCost ?? 0;
        const remainingBalance = Math.max(0, estimatedCost / 2);

        return {
            invoice: {
                total: estimatedCost,
                advance: Math.round(estimatedCost / 2),
                remaining: Math.round(remainingBalance)
            },
            advancePaymentStatus: "READY",
            remainingBalance: Math.round(remainingBalance),
            upgradePayments: "50% advance / 50% completion",
            billingModel: {
                initialProject: { advance: 50, completion: 50 },
                upgrade: { advance: 50, completion: 50 },
                maintenance: { type: "Monthly subscription" }
            }
        };
    }
}
