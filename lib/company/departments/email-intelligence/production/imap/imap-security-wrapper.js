export default class ImapSecurityWrapper {
    evaluate(input = {}) {
        const message = input.message ?? {};
        const body = `${message.subject ?? ""} ${message.body ?? ""}`.toLowerCase();
        const suspiciousPattern = /phishing|malware|credential|wire transfer|suspicious|invoice update/i.test(body);
        const attachmentCount = Array.isArray(message.attachments) ? message.attachments.length : 0;

        return {
            risk: suspiciousPattern || attachmentCount > 5 ? "MEDIUM" : "LOW",
            action: suspiciousPattern || attachmentCount > 5 ? "REVIEW" : "PROCESS",
            senderValidation: "PLACEHOLDER",
            phishingScore: suspiciousPattern ? 55 : 10,
            attachmentScan: "PLACEHOLDER",
            sender: String(message.from ?? ""),
            size: Number(message.body?.length ?? 0),
            suspiciousPatterns: suspiciousPattern ? ["keyword-match"] : []
        };
    }
}
