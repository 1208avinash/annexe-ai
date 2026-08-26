import assert from "assert/strict";
import fs from "fs";
import path from "path";

import { runEnterpriseScalingPlatform } from "./lib/platform/enterprise-scaling-platform.js";

const workspaceRoot = path.join(process.cwd(), "workspace", "enterprise-scaling-test");
fs.rmSync(workspaceRoot, { recursive: true, force: true });

const result = await runEnterpriseScalingPlatform({
  workspaceRoot,
  includeProductionPlatform: true,
  requestText: "Scale ANNEXE AI for thousands of customers, organizations, and concurrent AI projects."
});

assert.ok(result.success);
assert.ok(fs.existsSync(result.enterpriseReportPath));

const expectedFiles = [
  "database-scaling-report.json",
  "storage-readiness-report.json",
  "queue-performance-report.json",
  "event-system-report.json",
  "cache-performance-report.json",
  "system-health-report.json",
  "security-hardening-report.json",
  "tenant-readiness-report.json",
  "deployment-readiness-report.json",
  "enterprise-scaling-report.json"
];

for (const fileName of expectedFiles) {
  assert.ok(fs.existsSync(path.join(result.reportRoot, fileName)), fileName);
}

assert.equal(result.enterpriseReport.enterpriseReady, true);
assert.equal(result.enterpriseReport.status, "READY");
assert.equal(result.enterpriseReport.supportedCustomers, "10000+");
assert.equal(result.enterpriseReport.scalabilityScore, 100);

console.log(JSON.stringify({
  status: "PASS",
  readinessScore: result.enterpriseReport.scalabilityScore,
  enterpriseReady: result.enterpriseReport.enterpriseReady,
  supportedCustomers: result.enterpriseReport.supportedCustomers,
  reportRoot: result.reportRoot
}, null, 2));
