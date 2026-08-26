const INTENT_MAP = [
    { intent: "SECURITY_REPORT", department: "security", keywords: ["security", "phishing", "breach", "vulnerability"], action: "escalate_security" },
    { intent: "BILLING_REQUEST", department: "billing", keywords: ["invoice", "billing", "payment", "refund"], action: "review_billing" },
    { intent: "SUPPORT_REQUEST", department: "support", keywords: ["support", "issue", "broken", "help", "error"], action: "investigate_issue" },
    { intent: "DEMO_REQUEST", department: "sales", keywords: ["demo", "walkthrough", "presentation"], action: "schedule_demo" },
    { intent: "PARTNERSHIP_REQUEST", department: "sales", keywords: ["partner", "partnership", "collaboration", "reseller"], action: "route_to_partnerships" },
    { intent: "SALES_INQUIRY", department: "sales", keywords: ["pricing", "proposal", "quote", "purchase", "trial"], action: "prepare_sales_follow_up" }
];

function scoreIntent(text, rule) {
    return rule.keywords.reduce((score, keyword) => {
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        return regex.test(text) ? score + 1 : score;
    }, 0);
}

export default class IntentPredictionAgent {
    predict(input = {}) {
        const email = input.email ?? {};
        const text = `${email.subject ?? ""}\n${email.body ?? ""}`.trim();
        let best = {
            intent: "GENERAL_INFORMATION",
            confidence: 0.6,
            recommendedAction: "record_information",
            department: "general",
            score: 0
        };

        for (const rule of INTENT_MAP) {
            const score = scoreIntent(text, rule);
            if (score > best.score) {
                best = {
                    intent: rule.intent,
                    confidence: Math.min(0.98, 0.7 + (score * 0.08)),
                    recommendedAction: rule.action,
                    department: rule.department,
                    score
                };
            }
        }

        return {
            intent: best.intent,
            confidence: Number(best.confidence.toFixed(2)),
            recommendedAction: best.recommendedAction,
            department: best.department
        };
    }
}
