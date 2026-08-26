function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeMessage(message = {}, index = 0) {
    return {
        id: String(message.id ?? `imap-message-${index + 1}`),
        from: String(message.from ?? message.sender ?? ""),
        to: String(message.to ?? message.recipient ?? ""),
        subject: String(message.subject ?? ""),
        body: String(message.body ?? message.text ?? ""),
        receivedAt: String(message.receivedAt ?? message.date ?? new Date().toISOString()),
        attachments: Array.isArray(message.attachments) ? message.attachments : []
    };
}

export default class ImapClient {
    constructor({
        env = process.env,
        transport = null,
        mockMessages = []
    } = {}) {
        this.env = env ?? {};
        this.transport = transport;
        this.mockMessages = Array.isArray(mockMessages) ? mockMessages : [];
    }

    loadConfig() {
        return {
            host: String(this.env.EMAIL_HOST ?? "").trim(),
            port: toNumber(this.env.EMAIL_IMAP_PORT ?? this.env.EMAIL_PORT, 993),
            user: String(this.env.EMAIL_USER ?? "").trim(),
            password: String(this.env.EMAIL_PASSWORD ?? "").trim(),
            tls: String(this.env.EMAIL_TLS ?? "").trim().toLowerCase() === "true"
        };
    }

    connect(input = {}) {
        const baseConfig = this.loadConfig();
        const config = { ...baseConfig };
        for (const [key, value] of Object.entries(input ?? {})) {
            if (value === undefined || value === null) {
                continue;
            }

            if (typeof value === "string" && value.trim() === "") {
                continue;
            }

            config[key] = value;
        }

        const ready = Boolean(config.host && config.port && config.user && config.password && config.tls);

        return {
            status: ready ? "CONNECTED" : "NOT_READY",
            connected: ready,
            mailbox: config.user || "hello@annexai.co.uk",
            protocol: "imap",
            readOnly: true,
            secure: Boolean(config.tls),
            host: config.host || null,
            port: config.port || 993,
            user: config.user || null
        };
    }

    disconnect(session = {}) {
        return {
            status: "DISCONNECTED",
            connected: false,
            mailbox: session.mailbox ?? session.user ?? null
        };
    }

    listMessages(input = {}) {
        if (this.transport && typeof this.transport.listMessages === "function") {
            const messages = this.transport.listMessages(input) ?? [];
            return Array.isArray(messages) ? messages.map((message, index) => normalizeMessage(message, index)) : [];
        }

        const messages = Array.isArray(input.messages) && input.messages.length ? input.messages : this.mockMessages;
        return messages.map((message, index) => normalizeMessage(message, index));
    }

    readMessage(id, input = {}) {
        if (this.transport && typeof this.transport.readMessage === "function") {
            const message = this.transport.readMessage(id, input) ?? {};
            return normalizeMessage(message, 0);
        }

        const messages = this.listMessages(input);
        const message = messages.find((item) => String(item.id) === String(id)) ?? messages[0] ?? {};
        return normalizeMessage(message, 0);
    }
}
