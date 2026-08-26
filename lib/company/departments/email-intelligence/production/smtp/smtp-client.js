function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default class SmtpClient {
    constructor({
        env = process.env,
        transport = null
    } = {}) {
        this.env = env ?? {};
        this.transport = transport;
    }

    loadConfig() {
        return {
            host: String(this.env.EMAIL_SMTP_HOST ?? this.env.EMAIL_HOST ?? "").trim(),
            port: toNumber(this.env.EMAIL_SMTP_PORT ?? this.env.EMAIL_PORT, 587),
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
            protocol: "smtp",
            host: config.host || null,
            port: config.port || 587,
            user: config.user || null,
            secure: Boolean(config.tls)
        };
    }

    sendEmail(input = {}) {
        const connection = input.connection ?? this.connect(input.config ?? {});
        if (!connection.connected) {
            return {
                status: "FAILED",
                reason: "SMTP_NOT_READY",
                connection
            };
        }

        const message = {
            id: input.messageId ?? `SMTP-${Date.now()}`,
            from: String(input.from ?? connection.user ?? ""),
            to: String(input.to ?? ""),
            subject: String(input.subject ?? ""),
            body: String(input.body ?? ""),
            sentAt: new Date().toISOString()
        };

        if (this.transport && typeof this.transport.sendEmail === "function") {
            const transportResult = this.transport.sendEmail({
                connection,
                message
            });
            return {
                status: transportResult?.status ?? "SENT",
                connection,
                message: transportResult?.message ?? message
            };
        }

        return {
            status: "SENT",
            connection,
            message
        };
    }

    disconnect(connection = {}) {
        return {
            status: "DISCONNECTED",
            connected: false,
            protocol: connection.protocol ?? "smtp",
            host: connection.host ?? null,
            user: connection.user ?? null
        };
    }
}
