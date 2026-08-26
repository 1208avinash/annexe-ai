import fs from "fs";
import path from "path";

import ReplyApprovalManager from "../approvals/reply-approval-manager.js";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultApprovals() {
    return {
        pending: [],
        approved: [],
        rejected: []
    };
}

function buildItem(state = {}) {
    return {
        id: state.id ?? "",
        customer: state.customer ?? "",
        subject: state.subject ?? "",
        aiEmployee: state.aiEmployee ?? "",
        draft: state.reply?.body ?? "",
        status: state.status ?? "PENDING_APPROVAL"
    };
}

function readState(projectRoot) {
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

export default class ApprovalDashboardService {
    constructor({ approvalManager = new ReplyApprovalManager() } = {}) {
        this.approvalManager = approvalManager;
    }

    summarize(input = {}, projectRoot = null) {
        const approvals = defaultApprovals();
        const state = projectRoot ? readState(projectRoot) : input.approval ?? null;
        if (!state) {
            return approvals;
        }

        const item = buildItem({
            ...state,
            customer: state.customer ?? input.customerContext?.email ?? input.email?.from ?? "",
            subject: state.subject ?? input.email?.subject ?? "",
            aiEmployee: state.aiEmployee ?? input.employeeRouting?.employee ?? "",
            reply: state.reply ?? input.reply ?? null
        });

        if (item.status === "APPROVED") {
            approvals.approved.push(item);
        }
        else if (item.status === "REJECTED") {
            approvals.rejected.push(item);
        }
        else {
            approvals.pending.push(item);
        }

        return approvals;
    }

    persist(approvals, projectRoot) {
        if (!projectRoot) {
            return { approvals, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "approval-dashboard.json");
        writeJson(filePath, approvals);
        return { approvals, path: filePath };
    }

    approveReply(id, projectRoot = null, notes = []) {
        return this.approvalManager.approveReply(id, projectRoot, notes);
    }

    rejectReply(id, projectRoot = null, notes = []) {
        return this.approvalManager.rejectReply(id, projectRoot, notes);
    }

    editReply(id, content = "", projectRoot = null, notes = []) {
        return this.approvalManager.editReply(id, content, projectRoot, notes);
    }
}
