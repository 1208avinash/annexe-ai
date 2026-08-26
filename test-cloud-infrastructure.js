import assert from "assert/strict";
import fs from "fs";
import path from "path";

import { runCloudInfrastructureAdapterLayer } from "./lib/platform/cloud-infrastructure/cloud-infrastructure-orchestrator.js";

const workspaceRoot = path.join(process.cwd(), "workspace", "cloud-infrastructure-test");
fs.rmSync(workspaceRoot, { recursive: true, force: true });

const result = await runCloudInfrastructureAdapterLayer({
  workspaceRoot,
  requestText: "Prepare ANNEXE AI for enterprise cloud deployment with multi-region readiness.",
  region: "us-east-1",
  availabilityZone: "us-east-1a",
  dataResidency: "multi-region",
  complianceLocation: "global"
});

assert.ok(result.success);
assert.ok(fs.existsSync(result.reportPath));

const report = result.report;
assert.equal(report.databaseScore, 100);
assert.equal(report.storageScore, 100);
assert.equal(report.messagingScore, 100);
assert.equal(report.cacheScore, 100);
assert.equal(report.monitoringScore, 100);
assert.equal(report.deploymentScore, 100);
assert.equal(report.disasterRecoveryScore, 100);
assert.equal(report.multiRegionReadiness, 100);
assert.equal(report.overallCloudReadinessScore, 100);
assert.equal(report.status, "READY");
assert.ok(report.providers.aws.initialize.status === "READY");
assert.ok(report.providers.azure.initialize.status === "READY");
assert.ok(report.providers.gcp.initialize.status === "READY");
assert.ok(result.providers.aws.deploy.status === "READY");
assert.ok(result.providers.azure.deploy.status === "READY");
assert.ok(result.providers.gcp.deploy.status === "READY");
assert.ok(result.artifacts.artifactPath);
assert.ok(result.artifacts.reportMirrorPath);
assert.ok(result.artifacts.backupMirrorPath);

console.log(JSON.stringify({
  status: "PASS",
  reportPath: result.reportPath,
  databaseScore: report.databaseScore,
  storageScore: report.storageScore,
  messagingScore: report.messagingScore,
  cacheScore: report.cacheScore,
  monitoringScore: report.monitoringScore,
  deploymentScore: report.deploymentScore,
  disasterRecoveryScore: report.disasterRecoveryScore,
  multiRegionReadiness: report.multiRegionReadiness,
  overallCloudReadinessScore: report.overallCloudReadinessScore
}, null, 2));
