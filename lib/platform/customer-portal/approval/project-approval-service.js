export default class ProjectApprovalService {
    approve(input = {}) {
        const proposal = input.company?.proposal?.proposal ?? {};
        return {
            status: proposal.status ?? "AWAITING_APPROVAL",
            action: "Approve or request changes",
            paymentGate: "50% advance required",
            canProceed: Boolean(input.company?.success)
        };
    }
}
