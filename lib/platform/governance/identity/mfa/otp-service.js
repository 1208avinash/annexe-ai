import crypto from "crypto";

export default class OtpService {
    generate() {
        const code = String(crypto.randomInt(100000, 999999));
        return {
            code,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
    }

    verify({ code, challenge } = {}) {
        return String(code ?? "") === String(challenge ?? "");
    }
}
