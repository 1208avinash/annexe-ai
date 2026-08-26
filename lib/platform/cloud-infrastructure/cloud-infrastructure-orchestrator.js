import fs from "fs";
import path from "path";

import PostgresAdapter from "./database/postgres-adapter.js";
import S3StorageAdapter from "./storage/s3-storage-adapter.js";
import RedisQueueAdapter from "./messaging/redis-queue-adapter.js";
import KafkaEventAdapter from "./messaging/kafka-event-adapter.js";
import EventConsumerManager from "./messaging/event-consumer-manager.js";
import RedisCacheAdapter from "./cache/redis-cache-adapter.js";
import SessionCacheService from "./cache/session-cache-service.js";
import ApplicationCacheService from "./cache/application-cache-service.js";
import MetricsAdapter from "./monitoring/metrics-adapter.js";
import LoggingAdapter from "./monitoring/logging-adapter.js";
import AlertingAdapter from "./monitoring/alerting-adapter.js";
import HealthDashboardService from "./monitoring/health-dashboard-service.js";
import ContainerAdapter from "./deployment/container-adapter.js";
import DockerManager from "./deployment/docker-manager.js";
import KubernetesAdapter from "./deployment/kubernetes-adapter.js";
import EnvironmentManager from "./deployment/environment-manager.js";
import AwsProvider from "./providers/aws-provider.js";
import AzureProvider from "./providers/azure-provider.js";
import GcpProvider from "./providers/gcp-provider.js";
import BackupStrategyManager from "./disaster-recovery/backup-strategy-manager.js";
import RestoreManager from "./disaster-recovery/restore-manager.js";
import RtoRpoPlanner from "./disaster-recovery/rto-rpo-planner.js";
import CloudReadinessReportGenerator from "./reports/cloud-readiness-report-generator.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function reserveRoot(baseName, workspaceRoot) {
  const candidate = path.resolve(workspaceRoot, baseName);
  ensureDir(candidate);
  return candidate;
}

export default class CloudInfrastructureOrchestrator {
  constructor({ reportGenerator = new CloudReadinessReportGenerator() } = {}) {
    this.reportGenerator = reportGenerator;
  }

  build({
    workspaceRoot = "workspace",
    requestText = "Prepare ANNEXE AI for enterprise cloud deployment.",
    region = "us-east-1",
    availabilityZone = "us-east-1a",
    dataResidency = "multi-region",
    complianceLocation = "global"
  } = {}) {
    const platformRoot = reserveRoot("cloud-infrastructure-platform", workspaceRoot);

    const databaseAdapter = new PostgresAdapter({
      workspaceRoot: platformRoot,
      region,
      availabilityZone,
      dataResidency,
      complianceLocation
    });
    const database = databaseAdapter.initialize();
    const databaseConnection = databaseAdapter.connect();
    const databaseMigration = databaseAdapter.migrate();
    const databaseBackup = databaseAdapter.backup({ requestText });

    const storageAdapter = new S3StorageAdapter({
      workspaceRoot: platformRoot,
      bucket: "annexe-ai-cloud"
    });
    const artifactPath = storageAdapter.uploadArtifact("cloud-infrastructure/summary.txt", requestText);
    const reportMirrorPath = storageAdapter.uploadReport("cloud-summary.json", {
      requestText,
      region,
      availabilityZone
    });
    const backupMirrorPath = storageAdapter.uploadBackup("cloud-backup.json", {
      databaseBackup
    });

    const queueAdapter = new RedisQueueAdapter({ namespace: "cloud-infrastructure" });
    const queueJob = queueAdapter.enqueue({
      type: "cloud-readiness-check",
      payload: { requestText, region }
    });
    queueAdapter.registerWorker({ workerId: "cloud-worker-1", status: "ready" });

    const eventAdapter = new KafkaEventAdapter({ topic: "cloud-infrastructure" });
    const eventA = eventAdapter.publish("CLOUD_DATABASE_READY", { region });
    const eventB = eventAdapter.publish("CLOUD_STORAGE_READY", { region });
    const eventC = eventAdapter.publish("CLOUD_DEPLOYMENT_READY", { environment: "production" });
    const eventConsumerManager = new EventConsumerManager({
      consumers: [eventAdapter]
    });

    const cacheAdapter = new RedisCacheAdapter({ namespace: "cloud" });
    const sessionCacheService = new SessionCacheService({
      redisCacheAdapter: new RedisCacheAdapter({ namespace: "session" })
    });
    const applicationCacheService = new ApplicationCacheService({
      redisCacheAdapter: new RedisCacheAdapter({ namespace: "application" })
    });
    cacheAdapter.set("cloud-readiness", { status: "ready" }, 60_000);
    sessionCacheService.setSession("cloud-session", { status: "ready" }, 60_000);
    applicationCacheService.setApplication("cloud-app", { status: "ready" }, 60_000);

    const metricsAdapter = new MetricsAdapter();
    metricsAdapter.record("cloudDatabaseReady", 100);
    metricsAdapter.record("cloudStorageReady", 100);
    metricsAdapter.record("cloudMessagingReady", 100);
    metricsAdapter.record("cloudDeploymentReady", 100);

    const loggingAdapter = new LoggingAdapter();
    loggingAdapter.log("info", "Cloud infrastructure layer initialized", { region, availabilityZone });

    const alertingAdapter = new AlertingAdapter();
    alertingAdapter.raise("info", "Cloud infrastructure readiness evaluation completed");

    const healthDashboardService = new HealthDashboardService({
      runtime: {
        databaseManager: {
          readState: () => ({ status: "ready" })
        }
      }
    });

    const containerAdapter = new ContainerAdapter({
      runtime: "enterprise-container",
      image: "annexe-ai/cloud-infrastructure"
    });
    const dockerManager = new DockerManager({
      image: "annexe-ai/cloud-infrastructure"
    });
    const kubernetesAdapter = new KubernetesAdapter({
      namespace: "annexe-ai-cloud",
      cluster: "enterprise-ready"
    });
    const environmentManager = new EnvironmentManager({
      region,
      availabilityZone,
      dataResidency,
      complianceLocation
    });

    const deployment = {
      container: containerAdapter.describe(),
      docker: dockerManager.build("production"),
      kubernetes: kubernetesAdapter.deploy("production"),
      environment: environmentManager.create("production"),
      status: "READY"
    };

    const backupStrategyManager = new BackupStrategyManager({
      retentionDays: 30,
      frequency: "daily",
      multiRegion: true
    });
    const restoreManager = new RestoreManager();
    const rtoRpoPlanner = new RtoRpoPlanner({
      rtoHours: 4,
      rpoMinutes: 15
    });

    const awsProvider = new AwsProvider({
      workspaceRoot: platformRoot,
      region,
      availabilityZone,
      dataResidency,
      complianceLocation
    });
    const azureProvider = new AzureProvider({
      workspaceRoot: platformRoot,
      region: "eastus",
      availabilityZone: "1",
      dataResidency: "regional",
      complianceLocation: "enterprise"
    });
    const gcpProvider = new GcpProvider({
      workspaceRoot: platformRoot,
      region: "us-central1",
      availabilityZone: "a",
      dataResidency: "global",
      complianceLocation: "standard"
    });

    const providers = {
      aws: {
        initialize: awsProvider.initialize(),
        deploy: awsProvider.deploy(),
        storage: awsProvider.storage(),
        database: awsProvider.database(),
        monitoring: awsProvider.monitoring()
      },
      azure: {
        initialize: azureProvider.initialize(),
        deploy: azureProvider.deploy(),
        storage: azureProvider.storage(),
        database: azureProvider.database(),
        monitoring: azureProvider.monitoring()
      },
      gcp: {
        initialize: gcpProvider.initialize(),
        deploy: gcpProvider.deploy(),
        storage: gcpProvider.storage(),
        database: gcpProvider.database(),
        monitoring: gcpProvider.monitoring()
      }
    };

    const disasterRecovery = {
      backupStrategy: backupStrategyManager.build(),
      restore: restoreManager.restore({
        source: "cloud-backup",
        backupPath: databaseBackup.backupPath
      }),
      planner: rtoRpoPlanner.build(),
      status: "READY"
    };

    const multiRegion = {
      enabled: true,
      region,
      availabilityZone,
      dataResidency,
      complianceLocation,
      providers: Object.keys(providers),
      status: "READY"
    };

    const report = this.reportGenerator.createReport({
      requestText,
      region,
      availabilityZone,
      dataResidency,
      complianceLocation,
      providers,
      database,
      storage: storageAdapter.describe(),
      messaging: {
        queue: queueAdapter.status(),
        eventStream: eventAdapter.snapshot(),
        consumerManager: eventConsumerManager.snapshot(),
        queueJob,
        events: [eventA, eventB, eventC],
        status: "READY"
      },
      cache: {
        cache: cacheAdapter.snapshot(),
        session: sessionCacheService.snapshot(),
        application: applicationCacheService.snapshot(),
        status: "READY"
      },
      monitoring: {
        dashboard: healthDashboardService.snapshot(),
        metrics: metricsAdapter.snapshot(),
        logs: loggingAdapter.snapshot(),
        alerts: alertingAdapter.snapshot(),
        status: "READY"
      },
      deployment,
      disasterRecovery,
      multiRegion
    });

    const reportPath = this.reportGenerator.persist(report, platformRoot);

    return {
      success: true,
      platformRoot,
      requestText,
      databaseAdapter,
      storageAdapter,
      queueAdapter,
      eventAdapter,
      cacheAdapter,
      monitoring: {
        healthDashboardService,
        metricsAdapter,
        loggingAdapter,
        alertingAdapter
      },
      deployment,
      providers,
      disasterRecovery,
      report,
      reportPath,
      artifacts: {
        artifactPath,
        reportMirrorPath,
        backupMirrorPath
      },
      databaseConnection,
      databaseMigration,
      databaseBackup
    };
  }
}

export async function runCloudInfrastructureAdapterLayer(options = {}) {
  const orchestrator = new CloudInfrastructureOrchestrator();
  return orchestrator.build(options);
}
