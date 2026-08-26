import crypto from "crypto";

export default class RecoveryManager {
    generateRecoveryCodes(count = 8) {
        return Array.from({ length: count }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
    }
}
