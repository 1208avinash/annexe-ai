const SPAM_PATTERNS = [
    /free money/i,
    /urgent action/i,
    /verify your password/i,
    /wire transfer/i,
    /win a prize/i,
    /bitcoin/i,
    /unsubscribe/i
];

const SUSPICIOUS_LINK_PATTERN = /https?:\/\/[^\s)]+/gi;

export default class EmailSecurityAgent {
    inspect(input = {}) {
        const subject = String(input.subject ?? "");
        const body = String(input.body ?? "");
        const text = `${subject}\n${body}`;
        const suspiciousLinks = text.match(SUSPICIOUS_LINK_PATTERN) ?? [];
        const spamIndicators = SPAM_PATTERNS.filter(pattern => pattern.test(text)).map(pattern => String(pattern));
        const phishingRiskScore = Math.min(100, (spamIndicators.length * 20) + (suspiciousLinks.length * 15));

        return {
            spamIndicators,
            suspiciousLinks,
            phishingRiskScore,
            spamRiskScore: Math.min(100, phishingRiskScore + (text.length < 20 ? 10 : 0)),
            riskLevel: phishingRiskScore >= 70 ? "HIGH" : phishingRiskScore >= 40 ? "MEDIUM" : "LOW"
        };
    }
}
