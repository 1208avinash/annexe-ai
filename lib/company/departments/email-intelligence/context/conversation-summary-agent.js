import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultConversationMemory() {
    return {
        conversationsAnalyzed: 0,
        threads: {},
        updatedAt: null
    };
}

function tokenize(text = "") {
    return String(text)
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter(Boolean);
}

function extractTopics(messages = []) {
    const text = messages.map(message => `${message.subject ?? ""} ${message.body ?? ""}`).join(" ");
    const tokens = tokenize(text);
    const keywords = ["pricing", "architecture", "demo", "proposal", "support", "billing", "security", "integration", "deployment"];
    return keywords.filter(keyword => tokens.includes(keyword));
}

function extractPendingActions(text = "") {
    const lowered = String(text).toLowerCase();
    const actions = [];
    if (/(demo|schedule|call|meeting)/i.test(lowered)) {
        actions.push("schedule technical call");
    }
    if (/(pricing|proposal|quote)/i.test(lowered)) {
        actions.push("prepare proposal");
    }
    if (/(support|issue|broken|help)/i.test(lowered)) {
        actions.push("investigate support issue");
    }
    if (/(billing|invoice|payment)/i.test(lowered)) {
        actions.push("review billing request");
    }
    return Array.from(new Set(actions));
}

export default class ConversationSummaryAgent {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultConversationMemory();
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "conversation-memory.json");
        if (!fs.existsSync(filePath)) {
            return defaultConversationMemory();
        }

        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return defaultConversationMemory();
        }
    }

    summarize(input = {}, projectRoot = null) {
        const memory = this.load(projectRoot);
        const messages = Array.isArray(input.messages) ? input.messages : [];
        const combinedText = messages.map(message => `${message.subject ?? ""} ${message.body ?? ""}`).join(" ").trim();
        const keyTopics = Array.from(new Set([
            ...(input.keyTopics ?? []),
            ...extractTopics(messages)
        ]));
        const pendingActions = Array.from(new Set([
            ...(input.pendingActions ?? []),
            ...extractPendingActions(combinedText)
        ]));
        const decisions = Array.from(new Set([
            ...(input.decisions ?? []),
            ...(messages.some(message => /proposal/i.test(`${message.subject ?? ""} ${message.body ?? ""}`)) ? ["proposal discussion"] : [])
        ]));
        const summary = input.summary ?? (
            keyTopics.length
                ? `Customer requested discussion about ${keyTopics.slice(0, 3).join(", ")}.`
                : "Customer conversation analyzed."
        );

        const record = {
            summary,
            keyTopics,
            decisions,
            pendingActions,
            messageCount: messages.length,
            updatedAt: new Date().toISOString()
        };

        memory.conversationsAnalyzed += 1;
        memory.threads[input.threadId ?? `thread-${memory.conversationsAnalyzed}`] = record;
        memory.updatedAt = record.updatedAt;

        if (projectRoot) {
            const filePath = path.join(projectRoot, "reports", "company", "email", "conversation-memory.json");
            writeJson(filePath, memory);
            return {
                summary: record,
                memory,
                path: filePath
            };
        }

        return {
            summary: record,
            memory,
            path: null
        };
    }
}
