import assert from "assert/strict";
import fs from "fs";
import path from "path";

import dispatchApiRoute from "./lib/api-route-dispatcher.js";
import { runProductionSaaSPlatform } from "./lib/platform/production-saas-platform.js";

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

async function callRoute({ method, url, body = null, headers = {} }) {
  const response = createResponse();
  await dispatchApiRoute({ method, url, body, headers }, response);
  return {
    statusCode: response.statusCode,
    body: response.payload
  };
}

const workspaceRoot = path.join(process.cwd(), "workspace", "production-platform-test");
fs.rmSync(workspaceRoot, { recursive: true, force: true });
process.env.ANNEXE_PLATFORM_WORKSPACE_ROOT = workspaceRoot;
process.env.ANNEXE_PLATFORM_DATA_ROOT = path.join(workspaceRoot, "data");

const result = await runProductionSaaSPlatform({
  workspaceRoot,
  includeCommercialPlatform: false,
  requestText: "Create a production SaaS platform with auth, billing, realtime operations, and secure persistence."
});

assert.ok(result.success);
assert.ok(fs.existsSync(result.reportPath));

process.env.ANNEXE_PLATFORM_WORKSPACE_ROOT = result.runtime.workspaceRoot;
process.env.ANNEXE_PLATFORM_DATA_ROOT = path.join(result.runtime.workspaceRoot, "data");

const login = await callRoute({
  method: "POST",
  url: "http://localhost/api/auth",
  body: {
    action: "login",
    email: "admin@annexe.ai",
    password: "Annexe-Admin-Password1!"
  }
});

assert.equal(login.statusCode, 200);
assert.ok(login.body.success);
assert.ok(login.body.token);

const headers = {
  authorization: `Bearer ${login.body.token}`
};

const users = await callRoute({
  method: "GET",
  url: "http://localhost/api/users",
  headers
});

assert.equal(users.statusCode, 200);
assert.ok(Array.isArray(users.body.users));

const organization = await callRoute({
  method: "POST",
  url: "http://localhost/api/organizations",
  headers,
  body: {
    name: "Demo Enterprise",
    industry: "Real Estate",
    plan: "enterprise"
  }
});

assert.equal(organization.statusCode, 200);
assert.ok(organization.body.organization?.id);

const project = await callRoute({
  method: "POST",
  url: "http://localhost/api/projects",
  headers,
  body: {
    organizationId: organization.body.organization.id,
    name: "Production CRM",
    industry: "CRM",
    totalAmount: 40000
  }
});

assert.equal(project.statusCode, 200);
assert.ok(project.body.project?.id);
assert.equal(project.body.paymentGate?.approved, true);

const payment = await callRoute({
  method: "POST",
  url: "http://localhost/api/payments",
  headers,
  body: {
    organizationId: organization.body.organization.id,
    projectId: project.body.project.id,
    totalAmount: 40000,
    currency: "USD"
  }
});

assert.equal(payment.statusCode, 200);
assert.ok(payment.body.payment?.invoice?.invoiceId);

const upgrade = await callRoute({
  method: "POST",
  url: "http://localhost/api/upgrades",
  headers,
  body: {
    organizationId: organization.body.organization.id,
    projectId: project.body.project.id,
    title: "Realtime Analytics Upgrade",
    description: "Add realtime dashboards and stronger billing controls.",
    estimate: 12000
  }
});

assert.equal(upgrade.statusCode, 200);
assert.ok(upgrade.body.upgrade?.id);

const reports = await callRoute({
  method: "GET",
  url: "http://localhost/api/reports",
  headers
});

assert.equal(reports.statusCode, 200);
assert.ok(reports.body.reportPaths);
assert.ok(reports.body.counts.users >= 1);
assert.ok(reports.body.counts.organizations >= 1);
assert.ok(reports.body.counts.projects >= 1);
assert.ok(reports.body.counts.payments >= 1);
assert.ok(reports.body.counts.upgrades >= 1);
assert.ok(reports.body.counts.auditLogs >= 1);

console.log(JSON.stringify({
  status: "PASS",
  productionReadinessScore: result.productionReport.readinessScore,
  reportPath: result.reportPath,
  apiRoutes: reports.body.reportPaths,
  counts: reports.body.counts
}, null, 2));
