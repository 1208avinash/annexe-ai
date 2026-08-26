import crypto from "crypto";

export default class PasswordService {
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(String(password ?? ""), salt, 64).toString("hex");
    return {
      salt,
      hash,
      algorithm: "scrypt"
    };
  }

  verifyPassword(password, passwordRecord) {
    if (!passwordRecord?.salt || !passwordRecord?.hash) {
      return false;
    }

    const testHash = crypto.scryptSync(String(password ?? ""), passwordRecord.salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(testHash, "hex"), Buffer.from(passwordRecord.hash, "hex"));
  }
}
