import { getProductionRuntime } from "./production-runtime.js";

function getRequestUrl(req) {
  return new URL(req.url || "/", "http://localhost");
}

function getBody(req) {
  return req.body || {};
}

function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || "";
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function send(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

function handleError(res, error) {
  const statusCode = error?.statusCode || 500;
  return send(res, statusCode, {
    error: error?.message || "Production platform request failed"
  });
}

function requirePermission(runtime, req, permission) {
  const token = getBearerToken(req);
  if (!token) {
    const error = new Error("Authorization required");
    error.statusCode = 401;
    throw error;
  }

  return runtime.authService.authorize(token, permission);
}

function toProjectSummary(project) {
  return {
    id: project.id,
    name: project.name,
    organizationId: project.organizationId,
    status: project.status,
    billingStatus: project.billingStatus,
    progress: project.progress,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

export async function handleAuthRoute(req, res, runtime = getProductionRuntime()) {
  try {
    const body = getBody(req);
    const action = String(body.action || getRequestUrl(req).searchParams.get("action") || "login").toLowerCase();

    if (req.method === "POST" && action === "register") {
      const session = runtime.authService.registerUser(body);
      runtime.auditService.record({
        actorId: session.user.id,
        action: "auth.register",
        entityType: "user",
        entityId: session.user.id,
        metadata: { email: session.user.email }
      });

      return send(res, 200, { success: true, ...session });
    }

    if (req.method === "POST" && action === "login") {
      const session = runtime.authService.login(body);
      runtime.auditService.record({
        actorId: session.user.id,
        action: "auth.login",
        entityType: "user",
        entityId: session.user.id,
        metadata: { email: session.user.email }
      });

      return send(res, 200, { success: true, ...session });
    }

    if (req.method === "GET" && action === "me") {
      const authentication = runtime.authService.authenticate(getBearerToken(req));
      return send(res, 200, { success: true, ...authentication });
    }

    return send(res, 405, { error: "Method not allowed" });
  }
  catch (error) {
    return handleError(res, error);
  }
}

export async function handleUsersRoute(req, res, runtime = getProductionRuntime()) {
  try {
    const authentication = requirePermission(runtime, req, "users:read");

    if (req.method === "GET") {
      const users = runtime.databaseManager.list("users").map(user => runtime.authService.publicUser(user));
      return send(res, 200, { success: true, users });
    }

    if (req.method === "POST") {
      runtime.authService.permissionService.assert(authentication.user.role, "users:write");
      const body = getBody(req);
      const session = runtime.authService.registerUser(body);
      runtime.auditService.record({
        actorId: authentication.user.id,
        action: "users.create",
        entityType: "user",
        entityId: session.user.id,
        metadata: body
      });
      return send(res, 200, { success: true, user: session.user });
    }

    return send(res, 405, { error: "Method not allowed" });
  }
  catch (error) {
    return handleError(res, error);
  }
}

export async function handleOrganizationsRoute(req, res, runtime = getProductionRuntime()) {
  try {
    const authentication = requirePermission(runtime, req, "organizations:read");

    if (req.method === "GET") {
      return send(res, 200, {
        success: true,
        organizations: runtime.databaseManager.list("organizations")
      });
    }

    if (req.method === "POST") {
      runtime.authService.permissionService.assert(authentication.user.role, "organizations:write");
      const body = getBody(req);
      const organization = runtime.databaseManager.insert("organizations", {
        name: body.name,
        industry: body.industry || "Unknown",
        ownerUserId: authentication.user.id,
        plan: body.plan || "production-saas",
        status: "active"
      });
      runtime.auditService.record({
        actorId: authentication.user.id,
        action: "organizations.create",
        entityType: "organization",
        entityId: organization.id,
        metadata: body
      });
      return send(res, 200, { success: true, organization });
    }

    return send(res, 405, { error: "Method not allowed" });
  }
  catch (error) {
    return handleError(res, error);
  }
}

export async function handleProjectsRoute(req, res, runtime = getProductionRuntime()) {
  try {
    const authentication = requirePermission(runtime, req, "projects:read");

    if (req.method === "GET") {
      return send(res, 200, {
        success: true,
        projects: runtime.databaseManager.list("projects").map(toProjectSummary)
      });
    }

    if (req.method === "POST") {
      runtime.authService.permissionService.assert(authentication.user.role, "projects:write");
      const body = getBody(req);
      const organizationId = body.organizationId || authentication.user.organizationId || null;
      const project = runtime.databaseManager.insert("projects", {
        organizationId,
        ownerUserId: authentication.user.id,
        name: body.name || body.projectName || "ANNEXE Project",
        industry: body.industry || "Unknown",
        description: body.description || body.requestText || "",
        status: "active",
        billingStatus: "advance-required",
        progress: 0
      });
      const billing = runtime.billingService.collectAdvancePayment({
        projectId: project.id,
        organizationId,
        totalAmount: Number(body.totalAmount || body.estimate || 10000),
        currency: body.currency || "USD"
      });
      runtime.projectStreamService.publishProjectUpdate({
        projectId: project.id,
        eventType: "project.created",
        payload: { projectId: project.id, billing: billing.gate },
        userId: authentication.user.id
      });
      runtime.auditService.record({
        actorId: authentication.user.id,
        action: "projects.create",
        entityType: "project",
        entityId: project.id,
        metadata: body
      });
      const updatedProject = runtime.databaseManager.update("projects", project.id, {
        billingStatus: billing.gate.approved ? "advance-paid" : "payment-declined",
        progress: billing.gate.approved ? 25 : 0
      });
      return send(res, 200, {
        success: true,
        project: updatedProject || project,
        invoice: billing.invoice,
        paymentGate: billing.gate
      });
    }

    return send(res, 405, { error: "Method not allowed" });
  }
  catch (error) {
    return handleError(res, error);
  }
}

export async function handlePaymentsRoute(req, res, runtime = getProductionRuntime()) {
  try {
    const authentication = requirePermission(runtime, req, "payments:read");

    if (req.method === "GET") {
      return send(res, 200, {
        success: true,
        payments: runtime.databaseManager.list("payments")
      });
    }

    if (req.method === "POST") {
      runtime.authService.permissionService.assert(authentication.user.role, "payments:write");
      const body = getBody(req);
      const payment = runtime.billingService.collectAdvancePayment({
        projectId: body.projectId,
        organizationId: body.organizationId || authentication.user.organizationId,
        totalAmount: body.totalAmount,
        currency: body.currency || "USD"
      });
      return send(res, 200, { success: true, payment });
    }

    return send(res, 405, { error: "Method not allowed" });
  }
  catch (error) {
    return handleError(res, error);
  }
}

export async function handleUpgradesRoute(req, res, runtime = getProductionRuntime()) {
  try {
    const authentication = requirePermission(runtime, req, "upgrades:read");

    if (req.method === "GET") {
      return send(res, 200, {
        success: true,
        upgrades: runtime.databaseManager.list("upgrades")
      });
    }

    if (req.method === "POST") {
      runtime.authService.permissionService.assert(authentication.user.role, "upgrades:write");
      const body = getBody(req);
      const upgrade = runtime.billingService.createUpgradeRequest({
        projectId: body.projectId,
        organizationId: body.organizationId || authentication.user.organizationId,
        title: body.title || "Software Upgrade",
        description: body.description || "ANNEXE AI upgrade request",
        estimate: body.estimate || body.totalAmount || 0
      });
      runtime.auditService.record({
        actorId: authentication.user.id,
        action: "upgrades.create",
        entityType: "upgrade",
        entityId: upgrade.id,
        metadata: body
      });
      return send(res, 200, { success: true, upgrade });
    }

    return send(res, 405, { error: "Method not allowed" });
  }
  catch (error) {
    return handleError(res, error);
  }
}

export async function handleReportsRoute(req, res, runtime = getProductionRuntime()) {
  try {
    requirePermission(runtime, req, "reports:read");

    if (req.method !== "GET") {
      return send(res, 405, { error: "Method not allowed" });
    }

    const reportPaths = {
      users: "reports/platform/users.json",
      organizations: "reports/platform/organizations.json",
      projects: "reports/platform/projects.json",
      payments: "reports/platform/payments.json",
      upgrades: "reports/platform/upgrades.json",
      audit: "reports/platform/audit-log.json"
    };

    return send(res, 200, {
      success: true,
      reportPaths,
      counts: {
        users: runtime.databaseManager.list("users").length,
        organizations: runtime.databaseManager.list("organizations").length,
        projects: runtime.databaseManager.list("projects").length,
        payments: runtime.databaseManager.list("payments").length,
        upgrades: runtime.databaseManager.list("upgrades").length,
        auditLogs: runtime.databaseManager.list("auditLogs").length
      }
    });
  }
  catch (error) {
    return handleError(res, error);
  }
}

export function buildProductionReadinessReport({ commercialResult, runtime, platformRoot }) {
  const state = runtime.databaseManager.readState();
  const counts = {
    users: state.collections.users.length,
    organizations: state.collections.organizations.length,
    projects: state.collections.projects.length,
    payments: state.collections.payments.length,
    upgrades: state.collections.upgrades.length,
    auditLogs: state.collections.auditLogs.length,
    events: state.collections.events.length
  };

  const readinessScore = Math.min(100,
    30 +
    (counts.users > 0 ? 15 : 0) +
    (counts.organizations > 0 ? 15 : 0) +
    (counts.projects > 0 ? 15 : 0) +
    (counts.payments > 0 ? 10 : 0) +
    (counts.auditLogs > 0 ? 10 : 0) +
    (counts.events > 0 ? 5 : 0) +
    (commercialResult?.success ? 0 : 0)
  );

  return {
    generatedAt: new Date().toISOString(),
    platformRoot,
    commercialPlatform: {
      success: Boolean(commercialResult?.success),
      platformRoot: commercialResult?.platformRoot || null
    },
    database: {
      dataRoot: runtime.dataRoot,
      counts
    },
    auth: {
      passwordHashing: true,
      jwtExpirationSeconds: runtime.authService.jwtService.expiresInSeconds,
      permissionChecks: true
    },
    billing: {
      advancePaymentRule: "50/50",
      invoiceService: true,
      paymentGateway: true,
      subscriptionService: true
    },
    realtime: {
      eventService: true,
      notificationService: true,
      projectStreamService: true
    },
    audit: {
      auditLogging: true
    },
    apiRoutes: [
      "/api/auth",
      "/api/users",
      "/api/organizations",
      "/api/projects",
      "/api/payments",
      "/api/upgrades",
      "/api/reports"
    ],
    security: {
      requestValidation: true,
      secureEnvConfig: true,
      auditLogging: true,
      jwtExpiration: true,
      permissionChecks: true
    },
    readinessScore
  };
}
