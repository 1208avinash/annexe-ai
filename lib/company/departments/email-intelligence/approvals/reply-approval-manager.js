import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function buildState(input = {}) {
    return {
        id: input.id ?? `APPROVAL-${Date.now()}`,
        status: input.status ?? "PENDING_APPROVAL",
        createdAt: input.createdAt ?? new Date().toISOString(),
        approved: Boolean(input.approved ?? false),
        emailId: input.emailId ?? null,
        category: input.category ?? null,
        department: input.department ?? null,
        action: input.action ?? "draft_reply",
        customer: input.customer ?? "",
        subject: input.subject ?? "",
        aiEmployee: input.aiEmployee ?? "",
        reply: input.reply ?? null,
        reviewedAt: input.reviewedAt ?? null,
        notes: input.notes ?? []
    };
}

export default class ReplyApprovalManager {
    createApprovalState(input = {}, projectRoot = null) {
        const state = buildState({
            emailId: input.emailId ?? input.email?.id ?? null,
            category: input.classification?.category ?? input.category ?? null,
            department: input.route?.department ?? input.department ?? null,
            action: input.route?.action ?? input.action ?? "draft_reply",
            customer: input.customer ?? input.email?.from ?? input.customerContext?.email ?? "",
            subject: input.email?.subject ?? input.subject ?? "",
            aiEmployee: input.employeeRouting?.employee ?? input.aiEmployee ?? "",
            reply: input.reply ?? null
        });

        if (!projectRoot) {
            return { state, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "approval-state.json");
        writeJson(filePath, state);
        return { state, path: filePath };
    }

    load(projectRoot = null) {
        if (!projectRoot) {
            return null;
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "approval-state.json");
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

    persist(state = {}, projectRoot = null) {
        if (!projectRoot) {
            return { state, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "approval-state.json");
        writeJson(filePath, state);
        return { state, path: filePath };
    }

    approve(state = {}, notes = []) {
        return {
            ...state,
            status: "APPROVED",
            approved: true,
            reviewedAt: new Date().toISOString(),
            notes: Array.isArray(notes) ? notes : [String(notes)]
        };
    }

    edit(state = {}, notes = []) {
        return {
            ...state,
            status: "EDIT_REQUESTED",
            approved: false,
            reviewedAt: new Date().toISOString(),
            notes: Array.isArray(notes) ? notes : [String(notes)]
        };
    }

    reject(state = {}, notes = []) {
        return {
            ...state,
            status: "REJECTED",
            approved: false,
            reviewedAt: new Date().toISOString(),
            notes: Array.isArray(notes) ? notes : [String(notes)]
        };
    }

    approveReply(id, projectRoot = null, notes = []) {
        const current = this.load(projectRoot) ?? {};
        if (id && current.id && current.id !== id) {
            return { state: current, path: null };
        }

        const state = this.approve(current, notes);
        return this.persist(state, projectRoot);
    }

    rejectReply(id, projectRoot = null, notes = []) {
        const current = this.load(projectRoot) ?? {};
        if (id && current.id && current.id !== id) {
            return { state: current, path: null };
        }

        const state = this.reject(current, notes);
        return this.persist(state, projectRoot);
    }

    editReply(id, content = "", projectRoot = null, notes = []) {
        const current = this.load(projectRoot) ?? {};
        if (id && current.id && current.id !== id) {
            return { state: current, path: null };
        }

        const nextReply = typeof content === "object" && content !== null
            ? {
                ...(current.reply ?? {}),
                ...content
            }
            : {
                ...(current.reply ?? {}),
                body: String(content ?? "")
            };

        const state = {
            ...current,
            status: "EDIT_REQUESTED",
            approved: false,
            reviewedAt: new Date().toISOString(),
            notes: Array.isArray(notes) ? notes : [String(notes)],
            reply: nextReply
        };

        return this.persist(state, projectRoot);
    }
}
