import { createPaymentGate } from "../payment/schema.js";

function calculateAdvanceAmount(totalCost, percentage) {
    return Math.round((Number(totalCost ?? 0) * Number(percentage ?? 0)) / 100);
}

export default class RepairEstimator {
    estimate(input = {}) {
        const costEstimate = Number(input.costEstimate ?? 0);
        const advancePercentage = 50;
        const advanceAmount = calculateAdvanceAmount(costEstimate, advancePercentage);
        const paymentGate = createPaymentGate({
            projectId: input.projectId ?? null,
            proposalId: input.proposalId ?? null,
            status: "payment_pending",
            proposalApproved: true,
            requiredAdvancePercentage: advancePercentage,
            requiredAdvanceAmount: advanceAmount,
            totalProjectCost: costEstimate,
            currency: input.currency ?? "USD",
            paymentReceived: false,
            developmentUnlocked: false,
            unlockedAgents: []
        });

        return {
            costEstimate,
            advancePercentage,
            advanceAmount,
            paymentGate,
            paymentGateCreated: true
        };
    }
}
