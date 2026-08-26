export default class ImapAdapter {
    connect(connection = {}) {
        return {
            connected: Boolean(connection.host && connection.user),
            protocol: "imap",
            host: connection.host ?? null,
            port: connection.port ?? 993,
            secure: Boolean(connection.secure ?? true),
            readOnly: true
        };
    }

    fetchMessages(input = {}) {
        const messages = Array.isArray(input.messages) ? input.messages : [];
        return messages.map((message, index) => ({
            id: message?.id ?? `email-${index + 1}`,
            from: message?.from ?? "",
            to: message?.to ?? "",
            subject: message?.subject ?? "",
            body: message?.body ?? message?.text ?? "",
            receivedAt: message?.receivedAt ?? message?.date ?? new Date().toISOString(),
            attachments: Array.isArray(message?.attachments) ? message.attachments : []
        }));
    }
}
