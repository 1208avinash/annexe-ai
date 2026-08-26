function parseAdminIds(value = "") {
    return String(value)
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}

export default class TelegramClient {
    constructor({
        token = process.env.TELEGRAM_BOT_TOKEN ?? "",
        adminIds = process.env.TELEGRAM_ADMIN_IDS ?? "",
        transport = null
    } = {}) {
        this.token = token;
        this.adminIds = parseAdminIds(adminIds);
        this.transport = transport;
        this.initialized = false;
    }

    initialize() {
        this.initialized = true;
        return {
            status: "INITIALIZED",
            botTokenConfigured: Boolean(this.token),
            adminCount: this.adminIds.length
        };
    }

    sendMessage(payload = {}) {
        return {
            status: "QUEUED",
            chatId: payload.chatId ?? null,
            text: payload.text ?? "",
            sentAt: new Date().toISOString()
        };
    }

    receiveCommand(payload = {}) {
        return {
            userId: String(payload.userId ?? ""),
            command: String(payload.command ?? "").trim(),
            text: String(payload.text ?? payload.command ?? "").trim(),
            args: String(payload.args ?? "").trim(),
            receivedAt: payload.receivedAt ?? new Date().toISOString(),
            chatId: payload.chatId ?? null
        };
    }
}
