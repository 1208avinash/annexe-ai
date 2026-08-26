import crypto from "crypto";

import PasswordService from "./password-service.js";
import JwtService from "./jwt-service.js";
import PermissionService from "./permission-service.js";

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export default class AuthService {
  constructor({
    databaseManager,
    passwordService = new PasswordService(),
    jwtService = new JwtService(),
    permissionService = new PermissionService()
  } = {}) {
    this.databaseManager = databaseManager;
    this.passwordService = passwordService;
    this.jwtService = jwtService;
    this.permissionService = permissionService;
  }

  getUsers() {
    return this.databaseManager.list("users");
  }

  findUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    return this.databaseManager.findOne("users", user => user.email === normalizedEmail);
  }

  registerUser({ email, password, name, role = "customer", organizationId = null } = {}) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    if (this.findUserByEmail(normalizedEmail)) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const firstUser = this.getUsers().length === 0;
    const passwordRecord = this.passwordService.hashPassword(password);
    const user = this.databaseManager.insert("users", {
      email: normalizedEmail,
      name: String(name || normalizedEmail.split("@")[0] || "User"),
      role: firstUser ? "admin" : role,
      organizationId,
      status: "active",
      passwordHash: passwordRecord.hash,
      passwordSalt: passwordRecord.salt,
      passwordAlgorithm: passwordRecord.algorithm,
      lastLoginAt: null
    });

    return this.createSession(user);
  }

  login({ email, password } = {}) {
    const user = this.findUserByEmail(email);

    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const valid = this.passwordService.verifyPassword(password, {
      hash: user.passwordHash,
      salt: user.passwordSalt
    });

    if (!valid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const updated = this.databaseManager.update("users", user.id, {
      lastLoginAt: new Date().toISOString()
    });

    return this.createSession(updated || user);
  }

  createSession(user) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || null
    });

    const tokenId = crypto.createHash("sha256").update(token).digest("hex").slice(0, 24);
    const expiresAt = new Date(Date.now() + this.jwtService.expiresInSeconds * 1000).toISOString();
    this.databaseManager.insert("sessions", {
      userId: user.id,
      tokenId,
      expiresAt,
      status: "active"
    });

    return {
      token,
      tokenId,
      user: this.publicUser(user),
      expiresAt
    };
  }

  authenticate(token) {
    const payload = this.jwtService.verify(token);
    const user = this.databaseManager.findById("users", payload.sub);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    return {
      payload,
      user: this.publicUser(user)
    };
  }

  authorize(token, permission) {
    const authentication = this.authenticate(token);
    this.permissionService.assert(authentication.user.role, permission);
    return authentication;
  }

  publicUser(user) {
    if (!user) {
      return null;
    }

    const {
      passwordHash,
      passwordSalt,
      passwordAlgorithm,
      ...safeUser
    } = user;

    return safeUser;
  }
}
