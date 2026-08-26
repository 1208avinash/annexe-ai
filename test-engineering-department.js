import assert from "assert/strict";
import path from "path";

import EngineeringOrchestrator from "./lib/company/departments/engineering/engineering-orchestrator.js";

const orchestrator = new EngineeringOrchestrator();
const result = await orchestrator.processRequest({
    requestText: "Create an AI CRM platform for real estate companies",
    projectRoot: path.join("workspace", "engineering-department-test"),
    project: {
        projectId: "engineering-department-test",
        name: "AI CRM Engineering"
    },
    architectureDepartment: {
        solution: {
            frontendArchitecture: "React application",
            backendArchitecture: "FastAPI service layer",
            serviceBoundaries: ["Identity", "Customer Operations"]
        },
        cloud: {
            cloudRecommendation: "AWS"
        },
        security: {
            securityArchitecture: ["JWT authentication", "RBAC"]
        },
        database: {
            databaseRecommendation: "PostgreSQL"
        },
        integration: {
            integrationMap: ["Payments", "Messaging"]
        },
        scaling: {
            scalingStrategy: "microservice ready"
        }
    },
    productDepartment: {
        userStories: [
            { feature: "Authentication" },
            { feature: "Customer Management" },
            { feature: "Dashboard" }
        ]
    }
});

assert.ok(result.frontendPlan, "Expected frontend plan");
assert.ok(result.backendPlan, "Expected backend plan");
assert.ok(result.databasePlan, "Expected database plan");
assert.ok(result.aiPlan, "Expected AI plan");
assert.ok(result.integrationPlan, "Expected integration plan");
assert.ok(result.reviewResults, "Expected code review");
assert.ok(result.performanceAnalysis, "Expected performance report");
assert.ok(result.report, "Expected engineering report");
assert.ok(result.reportPath, "Expected engineering report path");
assert.equal(result.reportPath.replace(/\\/g, "/").includes("reports/company/engineering/engineering-execution-report.json"), true);

console.log(JSON.stringify({
    status: "PASS",
    frontendPlanGenerated: true,
    backendPlanGenerated: true,
    databasePlanGenerated: true,
    aiPlanGenerated: true,
    integrationPlanGenerated: true,
    codeReviewGenerated: true,
    performanceReportGenerated: true,
    engineeringReportGenerated: true,
    reportPath: result.reportPath
}, null, 2));
