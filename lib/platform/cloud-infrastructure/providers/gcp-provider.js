import ContainerAdapter from "../deployment/container-adapter.js";
import DockerManager from "../deployment/docker-manager.js";
import KubernetesAdapter from "../deployment/kubernetes-adapter.js";
import EnvironmentManager from "../deployment/environment-manager.js";
import S3StorageAdapter from "../storage/s3-storage-adapter.js";
import PostgresAdapter from "../database/postgres-adapter.js";
import HealthDashboardService from "../monitoring/health-dashboard-service.js";

export default class GcpProvider {
  constructor({
    workspaceRoot = "workspace",
    region = "us-central1",
    availabilityZone = "a",
    dataResidency = "global",
    complianceLocation = "standard"
  } = {}) {
    this.provider = "Google Cloud";
    this.workspaceRoot = workspaceRoot;
    this.region = region;
    this.availabilityZone = availabilityZone;
    this.dataResidency = dataResidency;
    this.complianceLocation = complianceLocation;
    this.container = new ContainerAdapter({ runtime: "cloud-run", image: "annexe-ai/gcp-cloud" });
    this.docker = new DockerManager({ image: "annexe-ai/gcp-cloud" });
    this.kubernetes = new KubernetesAdapter({ namespace: "annexe-ai-gcp", cluster: "gke-ready" });
    this.environment = new EnvironmentManager({ region, availabilityZone, dataResidency, complianceLocation });
    this.storageAdapter = new S3StorageAdapter({ workspaceRoot, bucket: "annexe-ai-gcp" });
    this.databaseAdapter = new PostgresAdapter({ workspaceRoot, region, availabilityZone, dataResidency, complianceLocation });
    this.monitoringService = new HealthDashboardService();
  }

  initialize() {
    return {
      provider: this.provider,
      region: this.region,
      availabilityZone: this.availabilityZone,
      dataResidency: this.dataResidency,
      complianceLocation: this.complianceLocation,
      status: "READY",
      initializedAt: new Date().toISOString()
    };
  }

  deploy() {
    return {
      container: this.container.describe(),
      docker: this.docker.build("production"),
      kubernetes: this.kubernetes.deploy("production"),
      environment: this.environment.create("production"),
      status: "READY"
    };
  }

  storage() {
    return this.storageAdapter.describe();
  }

  database() {
    return this.databaseAdapter.health();
  }

  monitoring() {
    return this.monitoringService.snapshot();
  }
}
