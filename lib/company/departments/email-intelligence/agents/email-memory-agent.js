import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultMemory() {
    return {
        memoryId: `EMAIL-MEM-${Date.now()}`,
        conversationCount: 0,
        senderHistory: {},
        emails: [],
        categories: {},
        languages: {},
        updatedAt: null
    };
}

function normalizeSender(value) {
    return String(value ?? "").trim().toLowerCase();
}

export default class EmailMemoryAgent {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultMemory();
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-memory.json");
        if (!fs.existsSync(filePath)) {
            return defaultMemory();
        }

        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return defaultMemory();
        }
    }

    remember(input = {}, projectRoot = null) {
        const memory = this.load(projectRoot);
        const email = input.email ?? {};
        const classification = input.classification ?? {};
        const route = input.route ?? {};
        const reply = input.reply ?? {};
        const approval = input.approval ?? {};
        const languageContext = input.languageContext ?? {};
        const sender = normalizeSender(email.from ?? "");
        const timestamp = email.receivedAt ?? new Date().toISOString();

        if (!memory.senderHistory[sender]) {
            memory.senderHistory[sender] = {
                sender,
                conversationCount: 0,
                previousCategory: null,
                lastInteraction: null,
                customerContext: null,
                languages: []
            };
        }

        const senderRecord = memory.senderHistory[sender];
        senderRecord.conversationCount += 1;
        senderRecord.previousCategory = classification.category ?? "GENERAL";
        senderRecord.lastInteraction = timestamp;
        senderRecord.customerContext = {
            subject: email.subject ?? "",
            department: classification.department ?? "Operations",
            routedDepartment: route.department ?? null,
            routedAction: route.action ?? null,
            priority: classification.priority ?? "MEDIUM",
            requiresApproval: Boolean(reply.requiresApproval ?? true),
            approvalStatus: approval.status ?? null
        };

        const locale = languageContext.locale ?? "en-US";
        if (locale && !senderRecord.languages.includes(locale)) {
            senderRecord.languages.push(locale);
        }

        memory.conversationCount += 1;
        memory.categories[classification.category ?? "GENERAL"] = (memory.categories[classification.category ?? "GENERAL"] ?? 0) + 1;
        memory.languages[languageContext.language ?? "English"] = (memory.languages[languageContext.language ?? "English"] ?? 0) + 1;
        memory.emails.push({
            id: email.id ?? `email-${memory.conversationCount}`,
            sender,
            category: classification.category ?? "GENERAL",
            priority: classification.priority ?? "MEDIUM",
            department: classification.department ?? "Operations",
            routedDepartment: route.department ?? null,
            routedAction: route.action ?? null,
            approvalStatus: approval.status ?? null,
            locale,
            receivedAt: timestamp
        });
        memory.updatedAt = new Date().toISOString();

        if (projectRoot) {
            const filePath = path.join(projectRoot, "reports", "company", "email", "email-memory.json");
            writeJson(filePath, memory);
            return {
                memory,
                path: filePath
            };
        }

        return {
            memory,
            path: null
        };
    }
}
