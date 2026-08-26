import fs from "fs";
import path from "path";

import { runCommercialSaaSPlatform } from "./commercial-saas-platform.js";
import { createProductionRuntime } from "./production-runtime.js";
import { buildProductionReadinessReport } from "./production-api.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function reserveRoot(baseName, workspaceRoot) {
  const candidate = path.resolve(workspaceRoot, baseName);
  ensureDir(candidate);
  return candidate;
}

function restoreEnvironmentVariable(name, previousValue) {
  if (previousValue === undefined) {
    delete process.env[name];
  }
  else {
    process.env[name] = previousValue;
  }
}

export async function runProductionSaaSPlatform({
  workspaceRoot = "workspace",
  requestText = "Create a production-ready SaaS platform with auth, billing, and realtime operations.",
  answers = null,
  interactive = false,
  includeCommercialPlatform = true,
  commercialResult = null
} = {}) {
  const platformRoot = reserveRoot("production-saas-platform", workspaceRoot);
  const runtimeWorkspaceRoot = path.join(platformRoot, "runtime");
  const previousDataRoot = process.env.ANNEXE_PLATFORM_DATA_ROOT;
  const previousWorkspaceRoot = process.env.ANNEXE_PLATFORM_WORKSPACE_ROOT;

  process.env.ANNEXE_PLATFORM_DATA_ROOT = path.join(runtimeWorkspaceRoot, "data");
  process.env.ANNEXE_PLATFORM_WORKSPACE_ROOT = runtimeWorkspaceRoot;

  ensureDir(runtimeWorkspaceRoot);
  const runtime = createProductionRuntime({ workspaceRoot: runtimeWorkspaceRoot });

  let commercialPlatform = commercialResult;
  if (includeCommercialPlatform && !commercialPlatform) {
    commercialPlatform = await runCommercialSaaSPlatform({
      workspaceRoot: path.join(platformRoot, "commercial"),
      requestText,
      answers,
      interactive
    });
  }

  const adminUser = runtime.authService.registerUser({
    email: "admin@annexe.ai",
    password: "Annexe-Admin-Password1!",
    name: "ANNEXE Admin"
  });
  const login = runtime.authService.login({
    email: "admin@annexe.ai",
    password: "Annexe-Admin-Password1!"
  });
  const organization = runtime.databaseManager.insert("organizations", {
    name: "ANNEXE Production SaaS",
    industry: "Technology",
    ownerUserId: login.user.id,
    plan: "enterprise",
    status: "active"
  });
  const project = runtime.databaseManager.insert("projects", {
    organizationId: organization.id,
    ownerUserId: login.user.id,
    name: "ANNEXE Production CRM",
    industry: "CRM",
    description: requestText,
    status: "active",
    billingStatus: "advance-required",
    progress: 5
  });
  runtime.billingService.collectAdvancePayment({
    projectId: project.id,
    organizationId: organization.id,
    totalAmount: 50000,
    currency: "USD"
  });
  runtime.billingService.createUpgradeRequest({
    projectId: project.id,
    organizationId: organization.id,
    title: "Production scaling upgrade",
    description: "Enable autoscaling, observability, and stronger SLAs.",
    estimate: 12000
  });
  runtime.projectStreamService.publishProjectUpdate({
    projectId: project.id,
    eventType: "platform.initialized",
    payload: {
      organizationId: organization.id,
      userId: login.user.id
    },
    userId: login.user.id
  });
  runtime.auditService.record({
    actorId: adminUser.user.id,
    action: "platform.initialize",
    entityType: "platform",
    entityId: platformRoot,
    metadata: {
      requestText,
      commercialPlatformRoot: commercialPlatform?.platformRoot || null
    }
  });

  const productionReport = buildProductionReadinessReport({
    commercialResult: commercialPlatform,
    runtime,
    platformRoot
  });

  const reportPath = path.join(platformRoot, "reports", "platform", "production-readiness-report.json");
  writeJson(reportPath, productionReport);

  restoreEnvironmentVariable("ANNEXE_PLATFORM_DATA_ROOT", previousDataRoot);
  restoreEnvironmentVariable("ANNEXE_PLATFORM_WORKSPACE_ROOT", previousWorkspaceRoot);

  return {
    success: Boolean(commercialPlatform?.success ?? true),
    platformRoot,
    runtime,
    commercialPlatform,
    productionReport,
    reportPath,
    organization,
    project
  };
}
