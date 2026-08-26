import path from "path";

import DatabaseManager from "./infrastructure/database/database-manager.js";
import SchemaManager from "./infrastructure/database/schema-manager.js";
import MigrationManager from "./infrastructure/database/migration-manager.js";
import AuthService from "./auth/auth-service.js";
import BillingService from "./billing/billing-service.js";
import InvoiceService from "./billing/invoice-service.js";
import PaymentGateway from "./billing/payment-gateway.js";
import SubscriptionService from "./billing/subscription-service.js";
import EventService from "./realtime/event-service.js";
import NotificationService from "./realtime/notification-service.js";
import ProjectStreamService from "./realtime/project-stream-service.js";
import AuditService from "./audit/audit-service.js";

const runtimeCache = new Map();

export function createProductionRuntime({
  workspaceRoot = path.resolve(process.cwd(), "workspace", "production-platform")
} = {}) {
  const dataRoot = path.join(workspaceRoot, "data");
  const schemaManager = new SchemaManager();
  const migrationManager = new MigrationManager({ schemaManager });
  const databaseManager = new DatabaseManager({
    dataRoot,
    schemaManager,
    migrationManager
  });

  databaseManager.ensureInitialized();

  const eventService = new EventService({ databaseManager });
  const notificationService = new NotificationService({ eventService });
  const projectStreamService = new ProjectStreamService({ eventService, notificationService });
  const auditService = new AuditService({ databaseManager, eventService });
  const authService = new AuthService({ databaseManager });

  return {
    workspaceRoot,
    dataRoot,
    databaseManager,
    schemaManager,
    migrationManager,
    authService,
    billingService: new BillingService({
      databaseManager,
      invoiceService: new InvoiceService(),
      paymentGateway: new PaymentGateway(),
      subscriptionService: new SubscriptionService()
    }),
    eventService,
    notificationService,
    projectStreamService,
    auditService,
    permissionService: authService.permissionService
  };
}

export function getProductionRuntime(options = {}) {
  const dataRoot = process.env.ANNEXE_PLATFORM_DATA_ROOT || null;
  const workspaceRootFromData = dataRoot ? path.dirname(dataRoot) : null;
  const workspaceRoot = path.resolve(
    options.workspaceRoot ||
    process.env.ANNEXE_PLATFORM_WORKSPACE_ROOT ||
    workspaceRootFromData ||
    path.resolve(process.cwd(), "workspace", "production-platform")
  );

  const cacheKey = workspaceRoot;
  if (!runtimeCache.has(cacheKey)) {
    const runtime = createProductionRuntime({ workspaceRoot });
    runtimeCache.set(cacheKey, runtime);
  }

  return runtimeCache.get(cacheKey);
}

export function resetProductionRuntime() {
  runtimeCache.clear();
}
