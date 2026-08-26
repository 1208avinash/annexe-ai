export default class EmailSecurityPolicy {
    evaluate(input = {}) {
        const email = input.email ?? {};
        const body = `${email.subject ?? ""} ${email.body ?? ""}`.toLowerCase();
        const suspiciousPattern = /phishing|breach|malware|suspicious|credential/i.test(body);
        const risk = suspiciousPattern ? "MEDIUM" : "LOW";

        return {
            risk,
            action: risk === "LOW" ? "PROCESS" : "REVIEW",
            senderValidation: "PLACEHOLDER",
            phishingScore: risk === "LOW" ? 10 : 55,
            attachmentScan: "PLACEHOLDER"
        };
    }
}
