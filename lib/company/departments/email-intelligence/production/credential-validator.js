export default class CredentialValidator {
    validate(config = {}) {
        const ready =
            Boolean(config.host) &&
            Boolean(config.port) &&
            Boolean(config.user) &&
            Boolean(config.password) &&
            String(config.tls).toLowerCase() === "true";

        return {
            status: ready ? "READY" : "NOT_READY"
        };
    }
}
