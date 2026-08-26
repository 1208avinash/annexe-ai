function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function maskPassword(value) {
    return value ? "***REDACTED***" : null;
}

export default class EmailConnectionAgent {
    createConnection(input = {}) {
        const host = input.host ?? process.env.EMAIL_HOST ?? null;
        const user = input.user ?? process.env.EMAIL_USER ?? null;
        const password = input.password ?? process.env.EMAIL_PASSWORD ?? null;
        const port = toNumber(input.port ?? process.env.EMAIL_PORT, 993);
        const smtpPort = toNumber(input.smtpPort ?? process.env.EMAIL_SMTP_PORT, 587);

        return {
            provider: String(input.provider ?? (host && /namecheap/i.test(host) ? "namecheap-private-email" : "generic-imap-smtp")),
            host,
            port,
            user,
            secure: Boolean(input.secure ?? port === 993),
            supportsImap: true,
            supportsSmtpPreparation: true,
            smtp: {
                host,
                port: smtpPort,
                secure: Boolean(input.smtpSecure ?? smtpPort === 465)
            },
            credentials: {
                passwordStored: false,
                password: maskPassword(password)
            }
        };
    }
}
