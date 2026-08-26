export default class SmtpAdapter {
    prepareMessage(draft = {}) {
        return {
            readyForSending: true,
            envelope: {
                from: draft.from ?? null,
                to: draft.to ?? null
            },
            message: {
                subject: draft.subject ?? "",
                body: draft.body ?? ""
            },
            requiresApproval: Boolean(draft.requiresApproval ?? true)
        };
    }
}
