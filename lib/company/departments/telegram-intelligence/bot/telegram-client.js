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
        transport = null,
        baseUrl = process.env.TELEGRAM_API_BASE_URL ?? "https://api.telegram.org"
    } = {}) {
        this.token = token;
        this.adminIds = parseAdminIds(adminIds);
        this.transport = transport;
        this.baseUrl = String(baseUrl || "https://api.telegram.org").replace(/\/+$/, "");
        this.initialized = false;
        this.runtime = {
            running: false,
            stopping: false,
            offset: 0,
            timer: null,
            lastError: null
        };
    }

    isConfigured() {
        return Boolean(this.token);
    }

    initialize() {
        this.initialized = true;
        return {
            status: "INITIALIZED",
            botTokenConfigured: Boolean(this.token),
            adminCount: this.adminIds.length,
            runtime: this.token ? "READY" : "DISABLED"
        };
    }

    async _transportGetUpdates(offset = 0) {
        if (this.transport && typeof this.transport.getUpdates === "function") {
            return this.transport.getUpdates({
                offset,
                token: this.token,
                baseUrl: this.baseUrl
            });
        }

        const response = await fetch(`${this.baseUrl}/bot${this.token}/getUpdates?offset=${offset}&timeout=0`);
        if (!response.ok) {
            throw new Error(`TELEGRAM_GET_UPDATES_FAILED_${response.status}`);
        }

        return response.json();
    }

    async _transportSendMessage(payload = {}) {
        if (this.transport && typeof this.transport.sendMessage === "function") {
            return this.transport.sendMessage(payload);
        }

        const response = await fetch(`${this.baseUrl}/bot${this.token}/sendMessage`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                chat_id: payload.chatId ?? payload.chat_id ?? null,
                text: payload.text ?? "",
                parse_mode: payload.parseMode ?? "HTML"
            })
        });

        if (!response.ok) {
            throw new Error(`TELEGRAM_SEND_MESSAGE_FAILED_${response.status}`);
        }

        return response.json();
    }

    async startPolling({
        onUpdate = null,
        onError = null,
        interval = Number(process.env.TELEGRAM_POLL_INTERVAL ?? 1000),
        keepAlive = false
    } = {}) {
        const bootstrap = this.initialize();
        if (!this.token) {
            return {
                status: "DISABLED",
                reason: "TELEGRAM_BOT_TOKEN_MISSING",
                bootstrap
            };
        }

        if (this.runtime.running) {
            return {
                status: "RUNNING",
                bootstrap,
                offset: this.runtime.offset
            };
        }

        this.runtime.running = true;
        this.runtime.stopping = false;
        this.runtime.lastError = null;

        const loop = async () => {
            if (this.runtime.stopping) {
                this.runtime.running = false;
                return;
            }

            try {
                const payload = await this._transportGetUpdates(this.runtime.offset);
                const updates = Array.isArray(payload?.result) ? payload.result : [];

                for (const update of updates) {
                    const nextOffset = Number(update?.update_id ?? 0) + 1;
                    this.runtime.offset = Math.max(this.runtime.offset, nextOffset);

                    if (typeof onUpdate === "function") {
                        await onUpdate(update, this);
                    }
                }
            }
            catch (error) {
                this.runtime.lastError = error;
                if (typeof onError === "function") {
                    try {
                        await onError(error, this);
                    }
                    catch {
                        // Ignore handler failures so polling can continue safely.
                    }
                }
            }

            if (!this.runtime.stopping) {
                this.runtime.timer = setTimeout(loop, interval);
                if (!keepAlive && typeof this.runtime.timer.unref === "function") {
                    this.runtime.timer.unref();
                }
            }
        };

        void loop();

        return {
            status: "STARTED",
            bootstrap,
            mode: "polling",
            interval,
            adminCount: this.adminIds.length
        };
    }

    stopPolling() {
        this.runtime.stopping = true;
        this.runtime.running = false;

        if (this.runtime.timer) {
            clearTimeout(this.runtime.timer);
            this.runtime.timer = null;
        }

        return {
            status: "STOPPED"
        };
    }

    async pollOnce({ offset = this.runtime.offset ?? 0 } = {}) {
        const bootstrap = this.initialize();
        if (!this.token) {
            return {
                status: "DISABLED",
                bootstrap,
                updates: []
            };
        }

        const payload = await this._transportGetUpdates(offset);
        const updates = Array.isArray(payload?.result) ? payload.result : [];
        return {
            status: "OK",
            bootstrap,
            updates
        };
    }

    async sendMessage(payload = {}) {
        if (!this.token) {
            return {
                status: "QUEUED",
                chatId: payload.chatId ?? null,
                text: payload.text ?? "",
                sentAt: new Date().toISOString()
            };
        }

        try {
            const result = await this._transportSendMessage(payload);
            return {
                status: "SENT",
                chatId: payload.chatId ?? payload.chat_id ?? null,
                text: payload.text ?? "",
                sentAt: new Date().toISOString(),
                result
            };
        }
        catch (error) {
            return {
                status: "QUEUED",
                chatId: payload.chatId ?? null,
                text: payload.text ?? "",
                sentAt: new Date().toISOString(),
                error: error?.message ?? String(error)
            };
        }
    }

    receiveCommand(payload = {}) {
        const text = String(payload.text ?? payload.command ?? "").trim();
        let command = String(payload.command ?? "").trim();
        let args = String(payload.args ?? "").trim();

        if (!command && text.startsWith("/")) {
            const [head, ...rest] = text.split(/\s+/);
            command = head;
            if (!args) {
                args = rest.join(" ").trim();
            }
        }

        return {
            userId: String(payload.userId ?? ""),
            command,
            text,
            args,
            receivedAt: payload.receivedAt ?? new Date().toISOString(),
            chatId: payload.chatId ?? null
        };
    }
}
