import ContainerAdapter from "../deployment/container-adapter.js";
import DockerManager from "../deployment/docker-manager.js";
import KubernetesAdapter from "../deployment/kubernetes-adapter.js";
import EnvironmentManager from "../deployment/environment-manager.js";
import S3StorageAdapter from "../storage/s3-storage-adapter.js";
import PostgresAdapter from "../database/postgres-adapter.js";
import HealthDashboardService from "../monitoring/health-dashboard-service.js";

export default class AwsProvider {
  constructor({
    workspaceRoot = "workspace",
    region = "us-east-1",
    availabilityZone = "us-east-1a",
    dataResidency = "multi-region",
    complianceLocation = "global"
  } = {}) {
    this.provider = "AWS";
    this.workspaceRoot = workspaceRoot;
    this.region = region;
    this.availabilityZone = availabilityZone;
    this.dataResidency = dataResidency;
    this.complianceLocation = complianceLocation;
    this.container = new ContainerAdapter({ runtime: "aws-lambda", image: "annexe-ai/aws-cloud" });
    this.docker = new DockerManager({ image: "annexe-ai/aws-cloud" });
    this.kubernetes = new KubernetesAdapter({ namespace: "annexe-ai-aws", cluster: "eks-ready" });
    this.environment = new EnvironmentManager({ region, availabilityZone, dataResidency, complianceLocation });
    this.storageAdapter = new S3StorageAdapter({ workspaceRoot, bucket: "annexe-ai-aws" });
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
