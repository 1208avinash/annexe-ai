import fs from "fs";
import path from "path";

import ReplyApprovalManager from "../../email-intelligence/approvals/reply-approval-manager.js";
import ApprovalActionReportGenerator from "../reports/approval-action-report-generator.js";

function parseAdminIds(value = "") {
    return String(value)
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}

export default class TelegramApprovalService {
    constructor({
        approvalManager = new ReplyApprovalManager(),
        reportGenerator = new ApprovalActionReportGenerator(),
        adminIds = process.env.TELEGRAM_ADMIN_IDS ?? ""
    } = {}) {
        this.approvalManager = approvalManager;
        this.reportGenerator = reportGenerator;
        this.adminIds = parseAdminIds(adminIds);
    }

    authorize(userId = "") {
        const authorized = this.adminIds.length > 0 && this.adminIds.includes(String(userId));
        return {
            authorized
        };
    }

    loadApprovalState(projectRoot = null) {
        return this.approvalManager.load(projectRoot) ?? null;
    }

    findApproval(id = "", projectRoot = null) {
        const state = this.loadApprovalState(projectRoot);
        if (!state || state.id !== id) {
            return null;
        }

        return state;
    }

    approve(id = "", input = {}) {
        const authorization = this.authorize(input.userId ?? "");
        if (!authorization.authorized) {
            return {
                status: "ACCESS_DENIED",
                authorized: false
            };
        }

        const persisted = this.approvalManager.approveReply(id, input.projectRoot ?? null, input.notes ?? []);
        const report = this.reportGenerator.createReport({
            projectRoot: input.projectRoot ?? null,
            approvalsProcessed: 1,
            approved: 1,
            authorizedUsers: [String(input.userId ?? "")]
        });
        const reportResult = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            status: "APPROVED",
            authorized: true,
            action: "approve",
            approvalId: id,
            approval: persisted.state,
            report: reportResult.report,
            reportPath: reportResult.path
        };
    }

    reject(id = "", input = {}) {
        const authorization = this.authorize(input.userId ?? "");
        if (!authorization.authorized) {
            return {
                status: "ACCESS_DENIED",
                authorized: false
            };
        }

        const persisted = this.approvalManager.rejectReply(id, input.projectRoot ?? null, input.notes ?? []);
        const report = this.reportGenerator.createReport({
            projectRoot: input.projectRoot ?? null,
            approvalsProcessed: 1,
            rejected: 1,
            authorizedUsers: [String(input.userId ?? "")]
        });
        const reportResult = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            status: "REJECTED",
            authorized: true,
            action: "reject",
            approvalId: id,
            approval: persisted.state,
            report: reportResult.report,
            reportPath: reportResult.path
        };
    }

    edit(id = "", message = "", input = {}) {
        const authorization = this.authorize(input.userId ?? "");
        if (!authorization.authorized) {
            return {
                status: "ACCESS_DENIED",
                authorized: false
            };
        }

        const persisted = this.approvalManager.editReply(id, message, input.projectRoot ?? null, input.notes ?? []);
        const report = this.reportGenerator.createReport({
            projectRoot: input.projectRoot ?? null,
            approvalsProcessed: 1,
            edited: 1,
            authorizedUsers: [String(input.userId ?? "")]
        });
        const reportResult = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            status: "UPDATED",
            authorized: true,
            action: "edit",
            approvalId: id,
            approval: persisted.state,
            report: reportResult.report,
            reportPath: reportResult.path
        };
    }
}
