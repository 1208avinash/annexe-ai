import assert from "assert/strict";
import path from "path";

import ProductOrchestrator from "./lib/company/departments/product/product-orchestrator.js";

const orchestrator = new ProductOrchestrator();
const result = orchestrator.processRequest({
    requestText: "Create an AI CRM platform for real estate companies",
    industry: "Real Estate",
    projectRoot: path.join("workspace", "product-department-test"),
    project: {
        projectId: "product-department-test",
        name: "AI CRM Product"
    },
    features: [
        "Authentication",
        "Customer Management",
        "Dashboard",
        "Automation",
        "Notifications",
        "Analytics",
        "AI Lead Scoring"
    ]
});

assert.ok(result.productStrategy, "Expected product strategy");
assert.ok(result.roadmap, "Expected roadmap");
assert.ok(Array.isArray(result.priorities) && result.priorities.length > 0, "Expected feature priorities");
assert.ok(Array.isArray(result.userStories) && result.userStories.length > 0, "Expected user stories");
assert.ok(Array.isArray(result.acceptanceCriteria) && result.acceptanceCriteria.length > 0, "Expected acceptance criteria");
assert.ok(result.report, "Expected product report");
assert.ok(result.reportPath, "Expected product report path");
assert.equal(result.reportPath.replace(/\\/g, "/").includes("reports/company/product/product-strategy-report.json"), true);

console.log(JSON.stringify({
    status: "PASS",
    productStrategyGenerated: true,
    roadmapGenerated: true,
    featurePrioritiesGenerated: true,
    userStoriesGenerated: true,
    acceptanceCriteriaGenerated: true,
    productReportGenerated: true,
    reportPath: result.reportPath
}, null, 2));
