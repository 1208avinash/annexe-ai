export default class EmailProductionConfig {
    constructor(env = process.env) {
        this.env = env ?? {};
    }

    load() {
        return {
            host: String(this.env.EMAIL_HOST ?? "").trim(),
            port: String(this.env.EMAIL_PORT ?? "").trim(),
            user: String(this.env.EMAIL_USER ?? "").trim(),
            password: String(this.env.EMAIL_PASSWORD ?? "").trim(),
            tls: String(this.env.EMAIL_TLS ?? "").trim().toLowerCase()
        };
    }
}
