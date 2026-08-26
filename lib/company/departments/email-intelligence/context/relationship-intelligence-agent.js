const STAGE_ORDER = [
    "NEW_CONTACT",
    "INTERESTED",
    "DEMO_REQUESTED",
    "PROPOSAL_SENT",
    "NEGOTIATION",
    "CUSTOMER"
];

function normalizeStage(stage = "NEW_CONTACT") {
    return STAGE_ORDER.includes(stage) ? stage : "NEW_CONTACT";
}

function nextStage(stage) {
    const index = STAGE_ORDER.indexOf(normalizeStage(stage));
    return STAGE_ORDER[Math.min(STAGE_ORDER.length - 1, index + 1)];
}

export default class RelationshipIntelligenceAgent {
    track(input = {}) {
        const previousStage = normalizeStage(input.previousStage ?? input.customer?.relationshipStage ?? "NEW_CONTACT");
        const intent = String(input.intent ?? "GENERAL_INFORMATION");
        let currentStage = previousStage;

        if (intent === "DEMO_REQUEST") {
            currentStage = "DEMO_REQUESTED";
        }
        else if (intent === "SALES_INQUIRY" || intent === "PARTNERSHIP_REQUEST") {
            currentStage = previousStage === "NEW_CONTACT" ? "INTERESTED" : nextStage(previousStage);
        }
        else if (intent === "SUPPORT_REQUEST" || intent === "BILLING_REQUEST" || intent === "SECURITY_REPORT") {
            currentStage = previousStage;
        }
        else if (previousStage === "DEMO_REQUESTED" && intent === "GENERAL_INFORMATION") {
            currentStage = "PROPOSAL_SENT";
        }

        return {
            previousStage,
            currentStage,
            nextRecommendedAction: input.intent === "DEMO_REQUEST"
                ? "schedule demo"
                : currentStage === "INTERESTED"
                    ? "send proposal"
                    : currentStage === "PROPOSAL_SENT"
                        ? "follow up on proposal"
                        : currentStage === "NEGOTIATION"
                            ? "continue negotiation"
                            : "maintain relationship"
        };
    }
}
