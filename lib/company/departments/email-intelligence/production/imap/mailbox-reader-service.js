export default class MailboxReaderService {
    constructor({ client } = {}) {
        this.client = client;
    }

    normalize(message = {}, index = 0) {
        return {
            id: String(message.id ?? `imap-message-${index + 1}`),
            from: String(message.from ?? message.sender ?? ""),
            subject: String(message.subject ?? ""),
            body: String(message.body ?? message.text ?? ""),
            receivedAt: String(message.receivedAt ?? message.date ?? new Date().toISOString()),
            attachments: Array.isArray(message.attachments) ? message.attachments : []
        };
    }

    readMailbox(input = {}) {
        const connection = input.connection ?? this.client?.connect(input.config ?? {});
        const messages = this.client?.listMessages({
            messages: input.messages ?? input.mockMessages ?? [],
            connection
        }) ?? [];

        if (!connection?.connected) {
            return {
                status: connection?.status ?? "NOT_READY",
                connection,
                messages: [],
                unreadMessages: []
            };
        }

        const normalized = messages.map((message, index) => this.normalize(
            this.client?.readMessage(message.id ?? message, {
                messages,
                connection
            }) ?? message,
            index
        ));

        return {
            status: "READ",
            connection,
            messages: normalized,
            unreadMessages: normalized
        };
    }
}
