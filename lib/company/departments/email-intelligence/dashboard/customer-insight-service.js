import fs from "fs";
import path from "path";

function defaultInsight() {
    return {
        customers: [],
        activeConversations: [],
        relationshipStages: {}
    };
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}

export default class CustomerInsightService {
    summarize(projectRoot = null) {
        if (!projectRoot) {
            return defaultInsight();
        }

        const customerMemory = readJson(path.join(projectRoot, "reports", "company", "email", "customer-memory.json")) ?? {};
        const conversationMemory = readJson(path.join(projectRoot, "reports", "company", "email", "conversation-memory.json")) ?? {};
        const customers = Object.values(customerMemory.profiles ?? {});
        const activeConversations = Object.values(conversationMemory.threads ?? {});
        const relationshipStages = customers.reduce((acc, customer) => {
            const stage = customer.relationshipStage ?? "NEW_CONTACT";
            acc[stage] = (acc[stage] ?? 0) + 1;
            return acc;
        }, {});

        return {
            customers,
            activeConversations,
            relationshipStages
        };
    }
}
