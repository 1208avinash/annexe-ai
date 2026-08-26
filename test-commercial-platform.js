import assert from "assert/strict";
import fs from "fs";
import path from "path";

import { runCommercialSaaSPlatform } from "./lib/platform/commercial-saas-platform.js";

const result = await runCommercialSaaSPlatform({
    workspaceRoot: path.join(process.cwd(), "workspace", "commercial-platform-test"),
    requestText: "Create a CRM for a real estate agency with customer management, proposal approval, billing, tracking, and upgrade requests."
});

assert.ok(result.success);
assert.ok(result.company?.success);
assert.ok(result.customerPortal);
assert.ok(result.adminDashboard);
assert.ok(result.data);
assert.ok(fs.existsSync(path.join(result.platformRoot, "reports", "platform", "commercial-operating-system-report.json")));
assert.ok(fs.existsSync(path.join(result.platformRoot, "reports", "platform", "billing-model.json")));
assert.ok(fs.existsSync(path.join(result.platformRoot, "reports", "commercial-platform-report.json")));

console.log(JSON.stringify({
    status: "PASS",
    customerRegistration: true,
    ideaSubmission: true,
    proposalGeneration: true,
    approvalFlow: true,
    paymentGate: true,
    projectTracking: true,
    upgradeRequest: true,
    commercialOperatingSystemReport: true,
    platformRoot: result.platformRoot
}, null, 2));
