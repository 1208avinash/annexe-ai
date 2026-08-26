import assert from "assert/strict";
import path from "path";
import fs from "fs";

import QAOrchestrator from "./lib/company/departments/qa/qa-orchestrator.js";

const orchestrator = new QAOrchestrator();
const projectRoot = path.join(process.cwd(), "workspace", "qa-department-test");
const result = orchestrator.processRequest({
    requestText: "Create an AI CRM platform for real estate companies",
    project: {
        projectId: "TEST-QA-001",
        name: "QA Department Test"
    },
    projectRoot,
    productDepartment: {
        productStrategy: { vision: "AI powered CRM platform" },
        priorities: [
            { feature: "Authentication" },
            { feature: "Customer Management" },
            { feature: "Dashboard" }
        ],
        userStories: [
            { story: "As a sales manager I want to manage customers." },
            { story: "As a user I want to sign in securely." }
        ],
        acceptanceCriteria: [
            ["Authentication works"],
            ["Customer dashboard renders"],
            ["Customer records can be updated"]
        ]
    },
    architectureDepartment: {
        solution: {
            apiDesign: ["/health", "/auth/login", "/customers"],
            status: "READY"
        },
        cloud: { status: "READY" },
        security: { securityArchitecture: ["JWT", "RBAC"] },
        database: { status: "READY" },
        integration: { status: "READY" },
        scaling: { status: "READY" }
    },
    engineeringDepartment: {
        frontendPlan: { status: "READY" },
        backendPlan: { status: "READY" },
        databasePlan: { status: "READY" },
        aiPlan: { status: "READY" },
        integrationPlan: { status: "READY" },
        reviewResults: { status: "READY" },
        performanceAnalysis: { status: "READY" }
    },
    qaResults: {
        backend: { status: "PASS" },
        security: { passed: true },
        performance: { passed: true }
    }
});

assert.ok(result.functional);
assert.ok(result.api);
assert.ok(result.security);
assert.ok(result.performance);
assert.ok(result.accessibility);
assert.ok(result.regression);
assert.ok(result.releaseDecision);
assert.ok(result.report);
assert.ok(result.reportPaths);
assert.equal(result.releaseDecision.status, "APPROVED");
assert.ok(String(result.reportPaths.certification).includes(path.join("reports", "company", "qa", "quality-certification-report.json")));
assert.ok(fs.existsSync(result.reportPaths.certification));

console.log(JSON.stringify({
    status: "PASS",
    reportPath: result.reportPaths.certification,
    qualityScore: result.releaseDecision.qualityScore
}, null, 2));
