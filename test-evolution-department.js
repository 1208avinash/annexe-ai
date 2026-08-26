import assert from "assert/strict";
import path from "path";
import fs from "fs";

import EvolutionOrchestrator from "./lib/company/departments/evolution/evolution-orchestrator.js";

const orchestrator = new EvolutionOrchestrator();
const projectRoot = path.join(process.cwd(), "workspace", "evolution-department-test");
const result = orchestrator.processRequest({
    requestText: "Analyze and evolve an existing AI CRM platform",
    project: {
        projectId: "TEST-EVOL-001",
        name: "Evolution Department Test"
    },
    projectRoot
});

assert.ok(result.technology);
assert.ok(result.market);
assert.ok(result.product);
assert.ok(result.performance);
assert.ok(result.security);
assert.ok(result.ai);
assert.ok(result.recommendation);
assert.ok(result.roadmap);
assert.ok(result.report);
assert.ok(result.reportPaths);
assert.ok(String(result.reportPaths.certification).includes(path.join("reports", "company", "evolution", "software-evolution-report.json")));
assert.ok(fs.existsSync(result.reportPaths.certification));

console.log(JSON.stringify({
    status: "PASS",
    technologyEvolutionGenerated: true,
    marketEvolutionGenerated: true,
    productEvolutionGenerated: true,
    performanceEvolutionGenerated: true,
    securityEvolutionGenerated: true,
    aiImprovementGenerated: true,
    recommendationsGenerated: true,
    evolutionRoadmapGenerated: true,
    evolutionReportGenerated: true,
    reportPath: result.reportPaths.certification,
    evolutionScore: result.report.evolutionScore
}, null, 2));
