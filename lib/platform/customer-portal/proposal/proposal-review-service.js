export default class ProposalReviewService {
    review(input = {}) {
        const company = input.company ?? {};
        const proposal = company.proposal?.proposal ?? {};

        return {
            proposalSummary: proposal.title ?? "Commercial proposal",
            architecturePreview: company.blueprint?.architecture ?? null,
            costEstimate: company.estimation?.estimation?.estimatedCost ?? 0,
            deliverables: [
                "proposal",
                "architecture document",
                "reports",
                "certificates"
            ]
        };
    }
}
