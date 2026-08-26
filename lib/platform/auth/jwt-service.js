import crypto from "crypto";

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function parseBase64Url(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function signHmac(content, secret) {
  return crypto.createHmac("sha256", secret).update(content).digest("base64url");
}

export default class JwtService {
  constructor({
    secret = process.env.ANNEXE_JWT_SECRET || "annexe-production-secret",
    issuer = "ANNEXE AI",
    audience = "annexe-platform",
    expiresInSeconds = 60 * 60 * 8
  } = {}) {
    this.secret = secret;
    this.issuer = issuer;
    this.audience = audience;
    this.expiresInSeconds = expiresInSeconds;
  }

  sign(payload = {}, options = {}) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (options.expiresInSeconds || this.expiresInSeconds);
    const tokenPayload = {
      ...payload,
      iss: options.issuer || this.issuer,
      aud: options.audience || this.audience,
      iat: now,
      exp,
      jti: crypto.randomUUID()
    };
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = base64Url(header);
    const encodedPayload = base64Url(tokenPayload);
    const signature = signHmac(`${encodedHeader}.${encodedPayload}`, this.secret);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify(token) {
    const [encodedHeader, encodedPayload, signature] = String(token ?? "").split(".");

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error("Invalid token");
    }

    const expectedSignature = signHmac(`${encodedHeader}.${encodedPayload}`, this.secret);

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw new Error("Invalid token signature");
    }

    const header = parseBase64Url(encodedHeader);
    if (header.alg !== "HS256") {
      throw new Error("Unsupported token algorithm");
    }

    const payload = parseBase64Url(encodedPayload);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && now > payload.exp) {
      throw new Error("Token expired");
    }

    return payload;
  }
}
