export default class SmtpSecurityWrapper {
    evaluate(input = {}) {
        const approval = input.approval ?? {};
        const draft = approval.reply ?? input.draft ?? null;
        const recipient = String(input.recipient ?? approval.customer ?? "");
        const sender = String(input.sender ?? "");
        const allowed =
            approval.status === "APPROVED" &&
            Boolean(recipient) &&
            Boolean(draft) &&
            Boolean(sender);

        return {
            allowed,
            reason: allowed ? "" : "APPROVAL_OR_MESSAGE_NOT_READY",
            approvalStatus: approval.status ?? "UNKNOWN",
            recipient,
            sender
        };
    }
}
