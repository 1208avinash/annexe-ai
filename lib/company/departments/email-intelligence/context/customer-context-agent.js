import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultCustomerMemory() {
    return {
        customersTracked: 0,
        profiles: {},
        updatedAt: null
    };
}

function normalizeEmail(value) {
    return String(value ?? "").trim().toLowerCase();
}

function deriveDepartment(interests = [], company = "") {
    const text = `${interests.join(" ")} ${company}`.toLowerCase();
    if (text.includes("billing") || text.includes("invoice") || text.includes("payment")) {
        return "billing";
    }
    if (text.includes("security") || text.includes("phishing") || text.includes("breach")) {
        return "security";
    }
    if (text.includes("support") || text.includes("help") || text.includes("issue")) {
        return "support";
    }
    if (text.includes("partner") || text.includes("partnership")) {
        return "partnership";
    }
    if (text.includes("demo") || text.includes("pricing") || text.includes("proposal") || text.includes("sales")) {
        return "sales";
    }
    return "general";
}

function derivePriority(interests = [], messages = []) {
    const text = `${interests.join(" ")} ${messages.map(message => `${message.subject ?? ""} ${message.body ?? ""}`).join(" ")}`.toLowerCase();
    if (/(urgent|critical|asap|broken|security|breach|payment failed)/i.test(text)) {
        return "high";
    }
    if (/(demo|pricing|proposal|quote|trial)/i.test(text)) {
        return "medium";
    }
    return "low";
}

function deriveRelationshipStage(interests = [], history = {}) {
    const stageFromInterest = interests.some(item => /demo/i.test(item))
        ? "DEMO_REQUESTED"
        : interests.some(item => /proposal|pricing|quote/i.test(item))
            ? "INTERESTED"
            : interests.some(item => /support|help|issue/i.test(item))
                ? "NEW_CONTACT"
                : "NEW_CONTACT";
    const conversationCount = Number(history.conversationCount ?? 0);
    if (conversationCount >= 5) {
        return "NEGOTIATION";
    }
    if (conversationCount >= 3 && stageFromInterest === "INTERESTED") {
        return "PROPOSAL_SENT";
    }
    return stageFromInterest;
}

export default class CustomerContextAgent {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultCustomerMemory();
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "customer-memory.json");
        if (!fs.existsSync(filePath)) {
            return defaultCustomerMemory();
        }

        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return defaultCustomerMemory();
        }
    }

    analyze(input = {}, projectRoot = null) {
        const memory = this.load(projectRoot);
        const email = input.email ?? {};
        const conversation = Array.isArray(input.messages) ? input.messages : [email];
        const emailAddress = normalizeEmail(email.from ?? input.emailAddress ?? "");
        const customerId = emailAddress || `customer-${Date.now()}`;
        const history = memory.profiles[customerId] ?? {
            customerId,
            email: emailAddress,
            company: input.company ?? "",
            history: {},
            interests: [],
            department: "general",
            priority: "low",
            relationshipStage: "NEW_CONTACT"
        };
        const interests = Array.from(new Set([
            ...(history.interests ?? []),
            ...(input.interests ?? []),
            String(email.subject ?? ""),
            String(email.body ?? "")
        ].filter(Boolean))).slice(0, 12);
        const company = input.company ?? email.company ?? history.company ?? "";
        const department = input.department ?? deriveDepartment(interests, company);
        const priority = input.priority ?? derivePriority(interests, conversation);
        const relationshipStage = input.relationshipStage ?? history.relationshipStage ?? deriveRelationshipStage(interests, history.history ?? {});
        const updatedProfile = {
            customerId,
            email: emailAddress,
            company,
            history: {
                ...(history.history ?? {}),
                lastInteraction: email.receivedAt ?? new Date().toISOString(),
                conversationCount: Number(history.history?.conversationCount ?? 0) + conversation.length
            },
            interests,
            department,
            priority,
            relationshipStage
        };

        memory.profiles[customerId] = updatedProfile;
        memory.customersTracked = Object.keys(memory.profiles).length;
        memory.updatedAt = new Date().toISOString();

        if (projectRoot) {
            const filePath = path.join(projectRoot, "reports", "company", "email", "customer-memory.json");
            writeJson(filePath, memory);
            return {
                customer: updatedProfile,
                memory,
                path: filePath
            };
        }

        return {
            customer: updatedProfile,
            memory,
            path: null
        };
    }

    persist(memory = defaultCustomerMemory(), projectRoot = null) {
        if (!projectRoot) {
            return { memory, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "customer-memory.json");
        writeJson(filePath, memory);
        return { memory, path: filePath };
    }
}
