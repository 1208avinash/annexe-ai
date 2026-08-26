import EmailSendService from "../../email-intelligence/production/smtp/email-send-service.js";
import ReplyApprovalManager from "../../email-intelligence/approvals/reply-approval-manager.js";

export default class ApprovalExecutionService {
    constructor({
        emailSendService = new EmailSendService(),
        approvalManager = new ReplyApprovalManager()
    } = {}) {
        this.emailSendService = emailSendService;
        this.approvalManager = approvalManager;
    }

    execute(input = {}) {
        const projectRoot = input.projectRoot ?? null;
        const approvalId = String(input.approvalId ?? "");
        const approval = input.approval ?? this.approvalManager.load(projectRoot) ?? null;

        if (!approval || (approvalId && approval.id && approval.id !== approvalId)) {
            return {
                status: "ERROR",
                reason: "APPROVAL_NOT_FOUND",
                approval: approval ?? null
            };
        }

        if (approval.status !== "APPROVED") {
            return {
                status: "BLOCKED",
                reason: "APPROVAL_NOT_APPROVED",
                approval
            };
        }

        const sendResult = this.emailSendService.sendApprovedReply({
            approval,
            projectRoot,
            approvalId: approval.id ?? approvalId,
            sender: input.sender ?? undefined,
            recipient: input.recipient ?? approval.customer ?? ""
        });

        return {
            status: sendResult.status,
            approval,
            sendResult
        };
    }
}
