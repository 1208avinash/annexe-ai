export default class ReleaseApprovalAgent {
    decide(input = {}) {
        const scores = [
            input.functional?.score ?? 0,
            input.api?.score ?? 0,
            input.security?.score ?? 0,
            input.performance?.score ?? 0,
            input.accessibility?.score ?? 0,
            input.regression?.score ?? 0
        ];
        const qualityScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        const status = qualityScore >= 90 ? "APPROVED" : "REJECTED";

        return {
            qualityScore,
            status,
            releaseRecommendation: status === "APPROVED" ? "READY" : "HOLD",
            reasons: status === "APPROVED"
                ? ["All QA checks passed at release threshold."]
                : ["One or more QA checks need remediation."]
        };
    }
}
