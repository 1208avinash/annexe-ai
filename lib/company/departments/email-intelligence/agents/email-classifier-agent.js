const CATEGORY_RULES = [
    {
        category: "SALES",
        department: "Sales",
        priority: "HIGH",
        confidence: 0.96,
        keywords: ["pricing", "proposal", "quote", "demo", "meeting", "crm", "budget", "purchase", "trial"]
    },
    {
        category: "SUPPORT",
        department: "Customer Support",
        priority: "HIGH",
        confidence: 0.94,
        keywords: ["support", "issue", "broken", "error", "help", "bug", "not working", "incident"]
    },
    {
        category: "PARTNERSHIP",
        department: "Business Development",
        priority: "MEDIUM",
        confidence: 0.9,
        keywords: ["partner", "partnership", "collaboration", "reseller", "integration"]
    },
    {
        category: "BILLING",
        department: "Finance",
        priority: "HIGH",
        confidence: 0.92,
        keywords: ["invoice", "billing", "payment", "refund", "charge", "subscription"]
    },
    {
        category: "SECURITY",
        department: "Security",
        priority: "CRITICAL",
        confidence: 0.97,
        keywords: ["security", "phishing", "breach", "compromised", "password", "threat", "vulnerability"]
    }
];

function scoreCategory(emailText, rule) {
    return rule.keywords.reduce((score, keyword) => {
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        return regex.test(emailText) ? score + 1 : score;
    }, 0);
}

export default class EmailClassifierAgent {
    classify(input = {}) {
        const email = input.email ?? {};
        const security = input.security ?? {};
        const emailText = `${email.subject ?? ""}\n${email.body ?? ""}`.trim();
        const isSpam = Boolean(security.spamRiskScore >= 70 || (security.spamIndicators ?? []).length >= 2);

        if (isSpam) {
            return {
                category: "SPAM",
                priority: "LOW",
                department: "Inbox Triage",
                confidence: 0.99
            };
        }

        let bestMatch = {
            category: "GENERAL",
            department: "Operations",
            priority: "MEDIUM",
            confidence: 0.8,
            score: 0
        };

        for (const rule of CATEGORY_RULES) {
            const score = scoreCategory(emailText, rule);
            if (score > bestMatch.score) {
                bestMatch = { ...rule, score };
            }
        }

        return {
            category: bestMatch.score > 0 ? bestMatch.category : "GENERAL",
            priority: bestMatch.score > 0 ? bestMatch.priority : "MEDIUM",
            department: bestMatch.score > 0 ? bestMatch.department : "Operations",
            confidence: bestMatch.score > 0 ? bestMatch.confidence : 0.78
        };
    }
}
