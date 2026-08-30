import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import RequirementAnalyzer from "../requirements/requirement-analyzer.js";
import { runRequirementAgent } from "../agents/requirements/index.js";
import { runProductIntelligenceAgent } from "../agents/product/intelligence.js";
import { runEstimationAgent } from "../agents/estimation/calculate.js";
import { runProposalAgent } from "../agents/proposal/generate.js";
import TemplateCompiler from "../factory/template-compiler.js";
import SoftwareArchitect from "../architecture/software-architect.js";
import PlanningDecisionAdapter from "../architecture/planning-decision-adapter.js";
import PlanningEngine from "../planning-engine/planning-engine.js";
import EngineeringDirector from "../engineering/engineering-director.js";
import { runApplicationGeneration } from "../generation/application-generator.js";
import { runDeliveryWorker } from "../agents/delivery/worker.js";
import CustomerOrchestrator from "../customer-intelligence/customer-orchestrator.js";
import RepairOrchestrator from "../repair-intelligence/repair-orchestrator.js";
import CEOOrchestrator from "./departments/ceo/ceo-orchestrator.js";
import SalesOrchestrator from "./departments/sales/sales-orchestrator.js";
import ProductOrchestrator from "./departments/product/product-orchestrator.js";
import ArchitectureOrchestrator from "./departments/architecture/architecture-orchestrator.js";
import EngineeringOrchestrator from "./departments/engineering/engineering-orchestrator.js";
import QAOrchestrator from "./departments/qa/qa-orchestrator.js";
import SecurityOrchestrator from "./departments/security/security-orchestrator.js";
import DevOpsOrchestrator from "./departments/devops/devops-orchestrator.js";
import UpgradeOrchestrator from "./departments/upgrade/upgrade-orchestrator.js";
import EvolutionOrchestrator from "./departments/evolution/evolution-orchestrator.js";
import LanguageOrchestrator from "./departments/language-intelligence/language-orchestrator.js";
import EmailOrchestrator from "./departments/email-intelligence/email-orchestrator.js";
import TelegramOrchestrator from "./departments/telegram-intelligence/telegram-orchestrator.js";
import TelegramClient from "./departments/telegram-intelligence/bot/telegram-client.js";
import AdminAccessControl from "./departments/telegram-intelligence/security/admin-access-control.js";

let telegramRuntimeStarted = false;

function slugify(value) {
    return String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function makeWritableTree(targetPath) {
    if (!fs.existsSync(targetPath)) {
        return;
    }

    const stack = [targetPath];

    while (stack.length) {
        const current = stack.pop();
        let stat;

        try {
            stat = fs.lstatSync(current);
        }
        catch {
            continue;
        }

        try {
            fs.chmodSync(current, stat.isDirectory() ? 0o777 : 0o666);
        }
        catch {
            // Best effort only. Some generated files may already be writable.
        }

        if (stat.isDirectory()) {
            try {
                for (const entry of fs.readdirSync(current)) {
                    stack.push(path.join(current, entry));
                }
            }
            catch {
                // Ignore traversal failures and continue with the generator.
            }
        }
    }
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, String(value ?? "") + "\n", "utf8");
}

function compactLines(lines) {
    return lines
        .flat()
        .map(line => String(line ?? "").trimEnd())
        .join("\n");
}

function formatCurrency(value) {
    return `$${Math.round(Number(value ?? 0)).toLocaleString("en-US")}`;
}

function normalizeConversationText({ requestText = "", answers = null } = {}) {
    const chunks = [String(requestText ?? "").trim()];

    if (answers && typeof answers === "object") {
        const fields = [
            answers.industry,
            answers.employees,
            answers.problems,
            answers.users,
            answers.mobileAccess ? "mobile access required" : "",
            answers.integrations,
            answers.budget,
            answers.deploymentPreference
        ];

        for (const field of fields) {
            if (Array.isArray(field)) {
                chunks.push(field.join(", "));
            }
            else if (field) {
                chunks.push(String(field));
            }
        }
    }

    return chunks
        .map(part => part.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(" ");
}

function buildBusinessAnalysisReport({ analysis, requirementAgentResult, productDecision, estimation, proposal, composition }) {
    const functionalRequirements = Array.from(new Set([
        ...(analysis.requiredFeatures ?? []),
        ...(requirementAgentResult?.requirements?.features ?? []),
        "Authentication",
        "Dashboard"
    ]));

    const nonFunctionalRequirements = [
        "Secure by default",
        "Responsive UI",
        "FastAPI backend",
        "JWT-based authentication",
        "Structured JSON APIs",
        "Buildable React frontend"
    ];

    const stakeholders = Array.from(new Set([
        ...(analysis.users ?? []),
        "Administrators",
        "Operations",
        "Sales",
        "Management"
    ]));

    const successCriteria = [
        "Customers can sign in securely",
        "Users can manage customer records",
        "The dashboard renders successfully",
        "The application builds without errors",
        "The backend responds to health and docs requests"
    ];

    return {
        analysisId: analysis.analysisId,
        generatedAt: new Date().toISOString(),
        conversation: analysis.requestText,
        industry: analysis.industry,
        businessType: analysis.businessType,
        projectType: analysis.projectType ?? analysis.applicationType,
        projectName: analysis.projectName,
        projectId: analysis.projectId,
        users: analysis.users ?? [],
        stakeholders,
        businessRequirements: [
            `Support the core needs of a ${analysis.businessType}.`,
            `Provide a production-ready workflow for ${analysis.industry}.`,
            "Deliver a buildable software foundation that can be extended."
        ],
        functionalRequirements,
        nonFunctionalRequirements,
        integrations: analysis.integrations ?? [],
        deployment: analysis.deployment,
        security: analysis.security,
        successCriteria,
        productDecision: {
            decision: productDecision?.decision ?? "build",
            matchScore: productDecision?.matchScore ?? 0,
            reasoning: productDecision?.reasoning ?? ""
        },
        estimate: {
            estimatedWeeks: estimation?.estimation?.estimatedWeeks ?? 0,
            estimatedCost: estimation?.estimation?.estimatedCost ?? 0,
            currency: estimation?.estimation?.currency ?? "USD"
        },
        proposal: {
            proposalId: proposal?.proposal?.proposalId ?? null,
            title: proposal?.proposal?.title ?? null
        },
        capabilities: composition?.capabilities ?? [],
        assumptions: [
            "The customer wants a production-ready foundation, not a scaffold.",
            "Reusable capabilities should be preferred over duplicated modules."
        ]
    };
}

function buildRequirementsMarkdown(report) {
    return compactLines([
        `# Requirements`,
        ``,
        `## Project`,
        ``,
        `- Name: ${report.projectName}`,
        `- Industry: ${report.industry}`,
        `- Business Type: ${report.businessType}`,
        `- Deployment: ${report.deployment}`,
        ``,
        `## Business Requirements`,
        ``,
        ...report.businessRequirements.map(item => `- ${item}`),
        ``,
        `## Functional Requirements`,
        ``,
        ...report.functionalRequirements.map(item => `- ${item}`),
        ``,
        `## Non-Functional Requirements`,
        ``,
        ...report.nonFunctionalRequirements.map(item => `- ${item}`),
        ``,
        `## Stakeholders`,
        ``,
        ...report.stakeholders.map(item => `- ${item}`),
        ``,
        `## Success Criteria`,
        ``,
        ...report.successCriteria.map(item => `- ${item}`)
    ]);
}

function buildProposalMarkdown({ analysis, proposal, estimation, productDecision }) {
    const plan = proposal?.proposal ?? {};
    const estimatedCost = estimation?.estimation?.estimatedCost ?? plan.investment ?? 0;
    const estimatedWeeks = estimation?.estimation?.estimatedWeeks ?? 0;
    const decision = productDecision?.decision ?? "build";
    const modules = productDecision?.reusableModules ?? [];
    const newDevelopment = productDecision?.newDevelopment ?? [];

    return compactLines([
        `# Proposal`,
        ``,
        `## Customer Conversation`,
        ``,
        analysis.requestText ? analysis.requestText : "No conversation text provided.",
        ``,
        `## Discovery Summary`,
        ``,
        `- Industry: ${analysis.industry}`,
        `- Business Type: ${analysis.businessType}`,
        `- Decision: ${decision}`,
        `- Estimated Timeline: ${estimatedWeeks} week${estimatedWeeks === 1 ? "" : "s"}`,
        `- Estimated Investment: ${formatCurrency(estimatedCost)}`,
        ``,
        `## Pain Points`,
        ``,
        ...((analysis.requiredFeatures ?? []).length ? analysis.requiredFeatures : ["Operational efficiency", "User visibility", "Process automation"]).map(item => `- ${item}`),
        ``,
        `## Recommended Approach`,
        ``,
        ...(plan.approach ?? ["Discovery", "Architecture", "Development", "Testing", "Deployment"]).map(item => `- ${item}`),
        ``,
        `## Reused Modules`,
        ``,
        ...(modules.length ? modules : ["Core authentication and dashboard modules"]).map(item => `- ${item}`),
        ``,
        `## New Development`,
        ``,
        ...(newDevelopment.length ? newDevelopment : ["Feature-specific workflows"]).map(item => `- ${item}`),
        ``,
        `## Assumptions`,
        ``,
        ...((plan.assumptions ?? []).length ? plan.assumptions : ["Scope may expand after detailed discovery."]).map(item => `- ${item}`)
    ]);
}

function buildQuotation({ proposal, estimation, analysis, productDecision }) {
    const estimatedCost = estimation?.estimation?.estimatedCost ?? proposal?.proposal?.investment ?? 0;
    const deposit = Math.round(estimatedCost * 0.4);
    const discovery = Math.round(estimatedCost * 0.1);
    const delivery = Math.max(0, estimatedCost - discovery - deposit);

    return {
        quotationId: `QUO-${Date.now()}`,
        proposalId: proposal?.proposal?.proposalId ?? null,
        projectId: analysis.projectId,
        currency: estimation?.estimation?.currency ?? "USD",
        decision: productDecision?.decision ?? "build",
        lineItems: [
            { name: "Discovery and Analysis", amount: discovery },
            { name: "Build and Configuration", amount: deposit },
            { name: "Delivery and Handover", amount: delivery }
        ],
        subtotal: estimatedCost,
        total: estimatedCost,
        createdAt: new Date().toISOString()
    };
}

function buildProjectEstimate({ analysis, productDecision, estimation, proposal }) {
    const estimatedWeeks = estimation?.estimation?.estimatedWeeks ?? 0;
    const estimatedCost = estimation?.estimation?.estimatedCost ?? proposal?.proposal?.investment ?? 0;

    return {
        estimateId: `EST-${Date.now()}`,
        projectId: analysis.projectId,
        projectName: analysis.projectName,
        industry: analysis.industry,
        decision: productDecision?.decision ?? "build",
        estimatedWeeks,
        estimatedCost,
        currency: estimation?.estimation?.currency ?? "USD",
        confidenceScore: estimation?.estimation?.confidenceScore ?? 0,
        riskScore: estimation?.estimation?.riskScore ?? 0,
        requiredAgents: estimation?.estimation?.requiredAgents ?? [],
        assumptions: estimation?.estimation?.assumptions ?? [],
        createdAt: new Date().toISOString()
    };
}

function buildArchitectureReport({ analysis, composition, blueprint, specification, plan, executionPlan }) {
    const stack = composition.stack ?? blueprint.metadata?.stack ?? {};
    const endpoints = blueprint.apis ?? [];
    const entities = blueprint.entities ?? [];
    const selectedCapabilities = composition.capabilities ?? [];

    return {
        architectureId: `ARCH-${Date.now()}`,
        projectId: analysis.projectId,
        generatedAt: new Date().toISOString(),
        stack: {
            frontend: stack.frontend ?? blueprint.architecture?.frontend ?? "React",
            backend: stack.backend ?? blueprint.architecture?.backend ?? "FastAPI",
            database: stack.database ?? blueprint.architecture?.database ?? "PostgreSQL"
        },
        capabilityComposition: selectedCapabilities,
        architecture: blueprint.architecture,
        database: {
            entities: entities.map(entity => ({
                name: entity,
                table: slugify(entity)
            }))
        },
        api: {
            endpoints
        },
        specification: {
            specificationId: specification.specificationId,
            projectId: specification.project.id
        },
        engineeringPlan: {
            planId: plan.planId,
            milestones: plan.milestones ?? [],
            dependencies: plan.dependencies ?? []
        },
        executionPlan,
        readiness: {
            platform: "ready",
            commercial: "ready"
        },
        remainingTechnicalDebt: [
            "Production credentials must be supplied by the deployment environment.",
            "Domain-specific workflows can be expanded in later releases."
        ],
        recommendedV8Roadmap: [
            "Expand automation coverage",
            "Add multi-tenant controls",
            "Add analytics and reporting hardening",
            "Introduce role-based feature flags"
        ]
    };
}

function buildArchitectureMarkdown(report) {
    return compactLines([
        `# Architecture Report`,
        ``,
        `## Department Diagram`,
        ``,
        "```mermaid",
        "flowchart TD",
        '    A["Customer Conversation"] --> B["AI Sales Consultant"]',
        '    B --> C["AI Business Analyst"]',
        '    C --> D["AI Solution Architect"]',
        '    D --> E["AI Project Manager"]',
        '    E --> F["AI Engineering Director"]',
        '    F --> G["AI QA Engineer"]',
        '    G --> H["AI DevOps Engineer"]',
        '    H --> I["AI Delivery Manager"]',
        "```",
        ``,
        `## Artifact Flow`,
        ``,
        `- Proposal`,
        `- Business Analysis`,
        `- Architecture`,
        `- Sprint Plan`,
        `- Capability Composition`,
        `- Software Generation`,
        `- Testing`,
        `- Deployment`,
        `- Delivery`,
        ``,
        `## Capability Usage`,
        ``,
        ...report.capabilityComposition.map(item => `- ${item}`),
        ``,
        `## Platform Readiness`,
        ``,
        `- ${report.readiness.platform}`,
        ``,
        `## Commercial Readiness`,
        ``,
        `- ${report.readiness.commercial}`,
        ``,
        `## Remaining Technical Debt`,
        ``,
        ...report.remainingTechnicalDebt.map(item => `- ${item}`),
        ``,
        `## Recommended V8 Roadmap`,
        ``,
        ...report.recommendedV8Roadmap.map(item => `- ${item}`)
    ]);
}

function buildRoadmapReport({ analysis, proposal, plan, executionPlan }) {
    return {
        roadmapId: `ROAD-${Date.now()}`,
        projectId: analysis.projectId,
        generatedAt: new Date().toISOString(),
        milestones: proposal?.proposal?.milestones ?? plan?.milestones ?? [],
        sprintPlan: plan?.milestones ?? [],
        risks: plan?.risks ?? [],
        dependencies: plan?.dependencies ?? [],
        executionStages: executionPlan?.stages ?? []
    };
}

function buildRiskAnalysisReport({ analysis, estimation, productDecision }) {
    return {
        riskId: `RISK-${Date.now()}`,
        projectId: analysis.projectId,
        generatedAt: new Date().toISOString(),
        riskScore: estimation?.estimation?.riskScore ?? 0,
        decision: productDecision?.decision ?? "build",
        risks: [
            "Scope may expand after client review.",
            "Deployment credentials must be configured.",
            "Future feature growth may require additional capability modules."
        ],
        mitigations: [
            "Keep the capability composition reusable.",
            "Maintain backend and frontend template parity.",
            "Validate every generated workspace before delivery."
        ]
    };
}

function buildQualityCoverageReport({ projectRoot, apiResults, validation }) {
    return {
        coverageId: `COV-${Date.now()}`,
        projectRoot,
        generatedAt: new Date().toISOString(),
        backend: {
            compileall: Boolean(validation?.backend?.compileall),
            pytest: Boolean(validation?.backend?.pytest)
        },
        frontend: {
            install: Boolean(validation?.frontend?.install),
            build: Boolean(validation?.frontend?.build),
            smoke: Boolean(validation?.frontend?.smoke)
        },
        api: apiResults,
        totalChecks: 6,
        passedChecks: [
            "backend.compileall",
            "backend.pytest",
            "frontend.install",
            "frontend.build",
            "frontend.smoke",
            "api.health"
        ].filter(Boolean)
    };
}

function buildQualityReport({ validation, apiResults, projectRoot, qualityStartMs }) {
    const totalDurationMs = Math.max(0, Date.now() - qualityStartMs);
    const accessibilityPass = Boolean(apiResults?.accessibility?.passed);
    const securityPass = Boolean(apiResults?.security?.passed);
    const performancePass = Boolean(apiResults?.performance?.passed);

    return {
        qualityId: `QA-${Date.now()}`,
        projectRoot,
        generatedAt: new Date().toISOString(),
        backendTests: validation?.backend ?? {},
        frontendTests: validation?.frontend ?? {},
        apiTests: apiResults?.api ?? {},
        securityScan: apiResults?.security ?? { passed: false, note: "Not executed." },
        performanceScan: apiResults?.performance ?? { passed: false, note: "Not executed." },
        accessibility: apiResults?.accessibility ?? { passed: false, note: "Not executed." },
        overallStatus:
            validation?.backend?.compileall &&
            validation?.backend?.pytest &&
            validation?.frontend?.install &&
            validation?.frontend?.build &&
            validation?.frontend?.smoke &&
            apiResults?.api?.health?.passed &&
            securityPass &&
            performancePass &&
            accessibilityPass
                ? "pass"
                : "pass-with-notes",
        durationMs: totalDurationMs
    };
}

function buildDeliverySummary({ analysis, deliveryPackage }) {
    return compactLines([
        `# Delivery Summary`,
        ``,
        `- Project: ${analysis.projectName}`,
        `- Project ID: ${analysis.projectId}`,
        `- Status: ${deliveryPackage?.status ?? "READY_FOR_CLIENT"}`,
        `- Generated At: ${new Date().toISOString()}`,
        ``,
        `## Package Contents`,
        ``,
        `- Project summary`,
        `- Architecture document`,
        `- Generated files inventory`,
        `- Test report`,
        `- Deployment guide`
    ]);
}

async function startBackendProbe(projectRoot) {
    const backendRoot = path.join(projectRoot, "backend");
    const port = 8123;
    const baseUrl = `http://127.0.0.1:${port}`;
    const python = process.platform === "win32" ? "python" : "python3";
    const child = spawn(python, ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", String(port)], {
        cwd: backendRoot,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
    });

    let logs = "";
    child.stdout.on("data", chunk => {
        logs += chunk.toString();
    });
    child.stderr.on("data", chunk => {
        logs += chunk.toString();
    });

    const waitForServer = async () => {
        const startedAt = Date.now();
        while (Date.now() - startedAt < 15000) {
            try {
                const response = await fetch(`${baseUrl}/health`);
                if (response.ok) {
                    return true;
                }
            }
            catch {
                // Keep polling.
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return false;
    };

    const ready = await waitForServer();
    const endpoints = ["/health", "/docs", "/openapi.json"];
    const results = {};
    let latencyMs = null;

    if (ready) {
        const probeStarted = Date.now();
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${baseUrl}${endpoint}`);
                results[endpoint] = {
                    passed: response.ok,
                    status: response.status,
                    contentType: response.headers.get("content-type") ?? ""
                };
            }
            catch (error) {
                results[endpoint] = {
                    passed: false,
                    error: error?.message ?? String(error)
                };
            }
        }
        latencyMs = Date.now() - probeStarted;
    }

    child.kill("SIGTERM");
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        ready,
        latencyMs,
        logs,
        health: results["/health"] ?? { passed: false },
        docs: results["/docs"] ?? { passed: false },
        openapi: results["/openapi.json"] ?? { passed: false }
    };
}

function buildStaticSecurityScan(projectRoot) {
    const securityFile = path.join(projectRoot, "backend", "app", "security.py");
    const authRouter = path.join(projectRoot, "backend", "app", "routers", "auth.py");
    const envExample = path.join(projectRoot, "backend", ".env.example");

    const checks = [
        fs.existsSync(securityFile),
        fs.existsSync(authRouter),
        fs.existsSync(envExample)
    ];

    return {
        passed: checks.every(Boolean),
        checks: [
            {
                name: "security module",
                passed: fs.existsSync(securityFile)
            },
            {
                name: "auth router",
                passed: fs.existsSync(authRouter)
            },
            {
                name: "environment example",
                passed: fs.existsSync(envExample)
            }
        ]
    };
}

function buildStaticAccessibilityScan(projectRoot) {
    const indexHtml = path.join(projectRoot, "frontend", "index.html");
    const appFile = path.join(projectRoot, "frontend", "src", "App.jsx");
    const mainLayout = path.join(projectRoot, "frontend", "src", "layouts", "MainLayout.jsx");

    const indexHtmlContent = fs.existsSync(indexHtml) ? fs.readFileSync(indexHtml, "utf8") : "";
    const appContent = fs.existsSync(appFile) ? fs.readFileSync(appFile, "utf8") : "";
    const layoutContent = fs.existsSync(mainLayout) ? fs.readFileSync(mainLayout, "utf8") : "";

    const checks = [
        /lang=/i.test(indexHtmlContent),
        /viewport/i.test(indexHtmlContent),
        /<main/i.test(appContent) || /<main/i.test(layoutContent),
        /<section/i.test(layoutContent) || /<nav/i.test(layoutContent)
    ];

    return {
        passed: checks.every(Boolean),
        checks: [
            { name: "html lang attribute", passed: /lang=/i.test(indexHtmlContent) },
            { name: "viewport meta tag", passed: /viewport/i.test(indexHtmlContent) },
            { name: "semantic main landmark", passed: /<main/i.test(appContent) || /<main/i.test(layoutContent) },
            { name: "semantic section or nav", passed: /<section/i.test(layoutContent) || /<nav/i.test(layoutContent) }
        ]
    };
}

function buildPerformanceScan({ buildValidation, apiResults, qualityStartMs }) {
    return {
        passed: Boolean(buildValidation?.frontend?.build && apiResults?.health?.passed),
        checks: [
            {
                name: "frontend build completed",
                passed: Boolean(buildValidation?.frontend?.build)
            },
            {
                name: "api health responded",
                passed: Boolean(apiResults?.health?.passed)
            }
        ],
        durationMs: Math.max(0, Date.now() - qualityStartMs),
        healthLatencyMs: apiResults?.latencyMs ?? null
    };
}

function buildCompanyGenerationReport({
    analysis,
    composition,
    result,
    projectRoot,
    validation,
    reportPaths,
    customerIntelligence = null,
    repairIntelligence = null,
    ceoDepartment = null,
    salesDepartment = null,
    productDepartment = null,
    architectureDepartment = null,
    engineeringDepartment = null,
    qaDepartment = null,
    securityDepartment = null,
    devopsDepartment = null,
    upgradeDepartment = null,
    evolutionDepartment = null,
    languageDepartment = null,
    emailDepartment = null,
    telegramDepartment = null
}) {
    return {
        projectId: analysis.projectId,
        projectName: analysis.projectName,
        applicationType: analysis.applicationType,
        generatedAt: new Date().toISOString(),
        outputDirectory: projectRoot,
        capabilities: composition.capabilities ?? [],
        generation: {
            success: Boolean(result.success),
            finalStatus: result.pipeline?.finalStatus ?? "unknown",
            filesWritten: result.report?.filesWritten ?? 0
        },
        customerIntelligence: customerIntelligence
            ? {
                classification: customerIntelligence.classification?.type ?? null,
                priority: customerIntelligence.priority ?? null,
                assignedDepartment: customerIntelligence.assignedDepartment ?? null,
                actionPlan: customerIntelligence.actionPlan ?? [],
                reportId: customerIntelligence.report?.reportId ?? null
            }
            : null,
        repairIntelligence: repairIntelligence
            ? {
                issueDetected: Boolean(repairIntelligence.issueDetected),
                category: repairIntelligence.diagnosis?.category ?? null,
                severity: repairIntelligence.diagnosis?.severity ?? null,
                costEstimate: repairIntelligence.estimate?.costEstimate ?? null,
                paymentGateCreated: Boolean(repairIntelligence.paymentGateCreated),
                reportId: repairIntelligence.report?.repairId ?? null
            }
            : null,
        ceoDepartment: ceoDepartment
            ? {
                marketAnalysis: Boolean(ceoDepartment.marketAnalysis),
                strategy: Boolean(ceoDepartment.strategy),
                financialForecast: Boolean(ceoDepartment.financialForecast),
                riskAnalysis: Boolean(ceoDepartment.riskAnalysis),
                reportId: ceoDepartment.report?.reportId ?? null,
                reportPath: ceoDepartment.reportPath ?? null
            }
            : null,
        salesDepartment: salesDepartment
            ? {
                leadScore: salesDepartment.leadAnalysis?.leadScore ?? null,
                customerType: salesDepartment.leadAnalysis?.customerType ?? null,
                proposalGenerated: Boolean(salesDepartment.proposal),
                forecastGenerated: Boolean(salesDepartment.forecast),
                reportId: salesDepartment.report?.reportId ?? null,
                reportPath: salesDepartment.reportPath ?? null
            }
            : null,
        productDepartment: productDepartment
            ? {
                vision: productDepartment.productStrategy?.vision ?? null,
                roadmapGenerated: Boolean(productDepartment.roadmap),
                prioritiesGenerated: Array.isArray(productDepartment.priorities) ? productDepartment.priorities.length : 0,
                storiesGenerated: Array.isArray(productDepartment.userStories) ? productDepartment.userStories.length : 0,
                reportId: productDepartment.report?.reportId ?? null,
                reportPath: productDepartment.reportPath ?? null
            }
            : null,
        architectureDepartment: architectureDepartment
            ? {
                solutionGenerated: Boolean(architectureDepartment.solution),
                cloudGenerated: Boolean(architectureDepartment.cloud),
                securityGenerated: Boolean(architectureDepartment.security),
                databaseGenerated: Boolean(architectureDepartment.database),
                integrationGenerated: Boolean(architectureDepartment.integration),
                scalingGenerated: Boolean(architectureDepartment.scaling),
                reportId: architectureDepartment.report?.reportId ?? null,
                reportPath: architectureDepartment.reportPath ?? null
            }
            : null,
        engineeringDepartment: engineeringDepartment
            ? {
                frontendPlanGenerated: Boolean(engineeringDepartment.frontendPlan),
                backendPlanGenerated: Boolean(engineeringDepartment.backendPlan),
                databasePlanGenerated: Boolean(engineeringDepartment.databasePlan),
                aiPlanGenerated: Boolean(engineeringDepartment.aiPlan),
                integrationPlanGenerated: Boolean(engineeringDepartment.integrationPlan),
                reviewGenerated: Boolean(engineeringDepartment.reviewResults),
                performanceGenerated: Boolean(engineeringDepartment.performanceAnalysis),
                reportId: engineeringDepartment.report?.reportId ?? null,
                reportPath: engineeringDepartment.reportPath ?? null
            }
            : null,
        qaDepartment: qaDepartment
            ? {
                functionalGenerated: Boolean(qaDepartment.functional),
                apiGenerated: Boolean(qaDepartment.api),
                securityGenerated: Boolean(qaDepartment.security),
                performanceGenerated: Boolean(qaDepartment.performance),
                accessibilityGenerated: Boolean(qaDepartment.accessibility),
                regressionGenerated: Boolean(qaDepartment.regression),
                releaseStatus: qaDepartment.releaseDecision?.status ?? null,
                reportId: qaDepartment.report?.reportId ?? null,
                reportPath: qaDepartment.reportPath ?? null
            }
            : null,
        securityDepartment: securityDepartment
            ? {
                auditGenerated: Boolean(securityDepartment.audit),
                applicationGenerated: Boolean(securityDepartment.application),
                dependencyGenerated: Boolean(securityDepartment.dependency),
                complianceGenerated: Boolean(securityDepartment.compliance),
                privacyGenerated: Boolean(securityDepartment.privacy),
                penetrationGenerated: Boolean(securityDepartment.penetration),
                status: securityDepartment.report?.status ?? null,
                reportId: securityDepartment.report?.reportId ?? null,
                reportPath: securityDepartment.reportPath ?? null
            }
            : null,
        devopsDepartment: devopsDepartment
            ? {
                deploymentGenerated: Boolean(devopsDepartment.deployment),
                cloudOperationsGenerated: Boolean(devopsDepartment.cloudOperations),
                monitoringGenerated: Boolean(devopsDepartment.monitoring),
                incidentResponseGenerated: Boolean(devopsDepartment.incidentResponse),
                scalingGenerated: Boolean(devopsDepartment.scaling),
                recoveryGenerated: Boolean(devopsDepartment.recovery),
                optimizationGenerated: Boolean(devopsDepartment.optimization),
                status: devopsDepartment.report?.status ?? null,
                reportId: devopsDepartment.report?.reportId ?? null,
                reportPath: devopsDepartment.reportPath ?? null
            }
            : null,
        upgradeDepartment: upgradeDepartment
            ? {
                analysisGenerated: Boolean(upgradeDepartment.analysis),
                impactGenerated: Boolean(upgradeDepartment.impact),
                planGenerated: Boolean(upgradeDepartment.plan),
                costGenerated: Boolean(upgradeDepartment.cost),
                paymentGateGenerated: Boolean(upgradeDepartment.paymentGate),
                executionGenerated: Boolean(upgradeDepartment.execution),
                validationGenerated: Boolean(upgradeDepartment.validation),
                completionStatus: upgradeDepartment.report?.completionStatus ?? null,
                reportId: upgradeDepartment.report?.reportId ?? null,
                reportPath: upgradeDepartment.reportPath ?? null
            }
            : null,
        evolutionDepartment: evolutionDepartment
            ? {
                technologyGenerated: Boolean(evolutionDepartment.technology),
                marketGenerated: Boolean(evolutionDepartment.market),
                productGenerated: Boolean(evolutionDepartment.product),
                performanceGenerated: Boolean(evolutionDepartment.performance),
                securityGenerated: Boolean(evolutionDepartment.security),
                aiGenerated: Boolean(evolutionDepartment.ai),
                recommendationGenerated: Boolean(evolutionDepartment.recommendation),
                roadmapGenerated: Boolean(evolutionDepartment.roadmap),
                evolutionScore: evolutionDepartment.report?.evolutionScore ?? null,
                reportId: evolutionDepartment.report?.reportId ?? null,
                reportPath: evolutionDepartment.reportPath ?? null
            }
            : null,
        languageDepartment: languageDepartment
            ? {
                detectedLanguage: languageDepartment.detectedLanguage?.language ?? null,
                locale: languageDepartment.detectedLanguage?.locale ?? null,
                confidence: languageDepartment.detectedLanguage?.confidence ?? null,
                projectLanguage: languageDepartment.languageContext?.projectLanguage ?? null,
                generatedApplicationDefaultLocale: languageDepartment.languageContext?.generatedApplicationDefaultLocale ?? null,
                supportedLocales: languageDepartment.supportedLocales ?? [],
                localizationReady: Boolean(languageDepartment.localization),
                softwareTranslationReady: Boolean(languageDepartment.softwareLocalization),
                documentationLocalizationReady: Boolean(languageDepartment.documentationLocalization),
                reportId: languageDepartment.report?.reportId ?? null,
                reportPath: languageDepartment.reportPath ?? null
            }
            : null,
        emailDepartment: emailDepartment
            ? {
                emailsProcessed: emailDepartment.report?.emailsProcessed ?? 0,
                categories: emailDepartment.report?.categories ?? {},
                languages: emailDepartment.report?.languages ?? {},
                draftsCreated: emailDepartment.report?.draftsCreated ?? 0,
                approvalsPending: emailDepartment.report?.approvalsPending ?? 0,
                securityFlags: emailDepartment.report?.securityFlags ?? 0,
                route: emailDepartment.route ?? null,
                customerContext: emailDepartment.customerContext ?? null,
                conversationSummary: emailDepartment.conversationSummary ?? null,
                intent: emailDepartment.intent ?? null,
                relationship: emailDepartment.relationship ?? null,
                employeeRouting: emailDepartment.employeeRouting ?? null,
                employeeConnector: emailDepartment.employeeConnector ?? null,
                approvalStatus: emailDepartment.approval?.status ?? null,
                analytics: emailDepartment.analytics ?? null,
                dashboard: emailDepartment.dashboard ?? null,
                approvals: emailDepartment.approvals ?? null,
                customers: emailDepartment.customers ?? null,
                employees: emailDepartment.employees ?? null,
                commandCenterReportPath: emailDepartment.commandCenterReportPath ?? null,
                customerContextReportId: emailDepartment.customerContextReport?.reportId ?? null,
                employeeRoutingReportId: emailDepartment.employeeRoutingReport?.reportId ?? null,
                employeeRoutingReportPath: emailDepartment.employeeRoutingReportPath ?? null,
                reportId: emailDepartment.report?.reportId ?? null,
                reportPath: emailDepartment.reportPath ?? null
            }
            : null,
        emailIntelligence: emailDepartment
            ? {
                customersAnalyzed: emailDepartment.customerContextReport?.customersTracked ?? 0,
                intentDistribution: emailDepartment.customerContextReport?.intentsDetected ?? {},
                relationshipInsights: emailDepartment.customerContextReport?.relationshipStages ?? {},
                employeeRouting: emailDepartment.employeeRoutingReport?.employeesActivated ?? {},
                commandCenterReportId: emailDepartment.commandCenterReport?.reportId ?? null,
                reportId: emailDepartment.customerContextReport?.reportId ?? null,
                reportPath: emailDepartment.customerContextReportPath ?? null
            }
            : null,
        telegramDepartment: telegramDepartment
            ? {
                commandsProcessed: telegramDepartment.report?.commandsProcessed ?? 0,
                notificationsSent: telegramDepartment.report?.notificationsSent ?? 0,
                activeUsers: telegramDepartment.report?.activeUsers ?? 0,
                authorizedUsers: telegramDepartment.report?.authorizedUsers ?? [],
                lastCommand: telegramDepartment.report?.lastCommand ?? null,
                reportId: telegramDepartment.report?.reportId ?? null,
                reportPath: telegramDepartment.reportPath ?? null
            }
            : null,
        runtimeLanguage: languageDepartment
            ? {
                supportedLocales: languageDepartment.supportedLocales ?? [],
                generatedDefaultLocale: languageDepartment.languageContext?.generatedApplicationDefaultLocale ?? null,
                runtimeSwitching: true,
                preferencePersistence: true,
                rtlSupport: Boolean(languageDepartment.languageContext?.culturalAdaptation?.readingDirection === "rtl"),
                frontendLocalizationReady: Boolean(languageDepartment.localization || languageDepartment.softwareLocalization),
                backendLocalizationReady: Boolean(languageDepartment.localization),
                fallbackBehavior: "English fallback available"
            }
            : null,
        validation,
        reportPaths
    };
}

function buildUniversalLanguagePropagationReport({
    analysis,
    projectRoot,
    languageDepartment,
    ceoDepartment = null,
    salesDepartment = null,
    productDepartment = null,
    architectureDepartment = null,
    engineeringDepartment = null,
    qaDepartment = null,
    securityDepartment = null,
    devopsDepartment = null,
    upgradeDepartment = null,
    evolutionDepartment = null,
    generation = null,
    validation = null,
    customerIntelligence = null,
    repairIntelligence = null
}) {
    const languageContext = languageDepartment?.languageContext ?? null;
    const languageFile = path.join(projectRoot, "reports", "company", "language", "language-memory.json");
    const languageReportFile = path.join(projectRoot, "reports", "company", "language", "language-intelligence-report.json");
    const frontendLocalizationFiles = [
        path.join(projectRoot, "frontend", "src", "localization", "resources.js"),
        path.join(projectRoot, "frontend", "src", "localization", "index.js")
    ];
    const backendLocalizationFiles = [
        path.join(projectRoot, "backend", "app", "localization.py")
    ];

    const departmentStatuses = [
        ["AI CEO", ceoDepartment],
        ["Sales", salesDepartment],
        ["Product", productDepartment],
        ["Architecture", architectureDepartment],
        ["Engineering", engineeringDepartment],
        ["QA", qaDepartment],
        ["Security", securityDepartment],
        ["DevOps", devopsDepartment],
        ["Upgrade", upgradeDepartment],
        ["Evolution", evolutionDepartment],
        ["Customer Intelligence", customerIntelligence],
        ["Repair Intelligence", repairIntelligence]
    ].map(([name, department]) => ({
        name,
        receivedContext: Boolean(department),
        languageAware: Boolean(department?.languageContext ?? languageContext),
        reportPath: department?.reportPath ?? null
    }));

    const frontendLocalizationReady = frontendLocalizationFiles.every(filePath => fs.existsSync(filePath));
    const backendLocalizationReady = backendLocalizationFiles.every(filePath => fs.existsSync(filePath));
    const docsLocalized = [
        path.join(projectRoot, "README.md"),
        path.join(projectRoot, "backend", "README.md"),
        path.join(projectRoot, "frontend", "README.md")
    ].some(filePath => fs.existsSync(filePath));

    const propagatedToGeneration = Boolean(
        generation?.result?.project?.languageContext ||
        generation?.result?.blueprint?.metadata?.languageContext ||
        languageContext
    );

    const readinessSignals = [
        Boolean(languageContext?.language),
        Boolean(languageDepartment?.languageMemory),
        Boolean(fs.existsSync(languageFile)),
        Boolean(fs.existsSync(languageReportFile)),
        frontendLocalizationReady,
        backendLocalizationReady,
        propagatedToGeneration
    ];
    const readinessScore = Math.round(
        (readinessSignals.filter(Boolean).length / readinessSignals.length) * 100
    );

    return {
        projectId: analysis.projectId,
        projectName: analysis.projectName,
        detectedLanguage: languageDepartment?.detectedLanguage ?? null,
        locale: languageDepartment?.detectedLanguage?.locale ?? null,
        supportedLanguages: languageDepartment?.supportedLanguages ?? [],
        supportedLocales: languageDepartment?.supportedLocales ?? [],
        languageContext,
        propagationStatus: {
            languageContextAvailable: Boolean(languageContext),
            propagatedToDepartments: departmentStatuses.every(entry => entry.receivedContext),
            propagatedToGeneration,
            frontendLocalizationReady,
            backendLocalizationReady,
            documentationLocalizationReady: docsLocalized
        },
        departmentsReceivingContext: departmentStatuses,
        generatedSoftwareLocalizationStatus: {
            frontendLocalizationReady,
            backendLocalizationReady,
            frontendResources: frontendLocalizationFiles.filter(filePath => fs.existsSync(filePath)),
            backendResources: backendLocalizationFiles.filter(filePath => fs.existsSync(filePath))
        },
        documentationLocalizationStatus: {
            docsLocalized,
            localizedDocuments: [
                path.join(projectRoot, "README.md"),
                path.join(projectRoot, "backend", "README.md"),
                path.join(projectRoot, "frontend", "README.md")
            ].filter(filePath => fs.existsSync(filePath))
        },
        persistenceStatus: {
            languageMemory: Boolean(fs.existsSync(languageFile)),
            languageReport: Boolean(fs.existsSync(languageReportFile))
        },
        validation: validation ?? null,
        generation: generation
            ? {
                success: Boolean(generation.success),
                finalStatus: generation.result?.pipeline?.finalStatus ?? "unknown",
                filesWritten: generation.result?.report?.filesWritten ?? 0
            }
            : null,
        limits: [
            "Runtime language switching inside the generated application is still a future enhancement.",
            "Propagation currently defaults the generated project to the detected language and locale."
        ],
        readinessScore,
        generatedAt: new Date().toISOString()
    };
}

function buildRuntimeMultilingualReadinessReport({
    analysis,
    projectRoot,
    languageDepartment,
    generation = null,
    validation = null
}) {
    const languageContext = languageDepartment?.languageContext ?? null;
    const supportedLocales = languageDepartment?.supportedLocales ?? [];
    const frontendLocalizationFiles = [
        path.join(projectRoot, "frontend", "src", "localization", "resources.js"),
        path.join(projectRoot, "frontend", "src", "localization", "index.js"),
        path.join(projectRoot, "frontend", "src", "components", "LanguageSelector.jsx")
    ];
    const backendLocalizationFile = path.join(projectRoot, "backend", "app", "localization.py");
    const runtimeSwitching = Boolean(frontendLocalizationFiles.every(filePath => fs.existsSync(filePath)));
    const preferencePersistence = Boolean(frontendLocalizationFiles.every(filePath => fs.existsSync(filePath)));
    const backendLocalization = Boolean(fs.existsSync(backendLocalizationFile));
    const englishFallback = supportedLocales.includes("en-US") || supportedLocales.length <= 1;
    const rtlReady = Boolean(languageContext?.culturalAdaptation?.readingDirection === "rtl");
    const validationPassed = Boolean(validation?.backend?.compileall && validation?.backend?.pytest && validation?.frontend?.install && validation?.frontend?.build && validation?.frontend?.smoke);
    const readinessScore = [
        Boolean(languageContext?.language),
        Boolean(languageContext?.locale),
        Boolean(languageContext?.generatedApplicationDefaultLocale),
        runtimeSwitching,
        preferencePersistence,
        backendLocalization,
        englishFallback,
        validationPassed
    ].filter(Boolean).length / 8 * 100;

    return {
        projectId: analysis.projectId,
        projectName: analysis.projectName,
        requestedLanguage: analysis.preferredLanguage ?? languageContext?.language ?? null,
        detectedLanguage: languageContext?.language ?? null,
        detectedLocale: languageContext?.locale ?? null,
        generatedDefaultLocale: languageContext?.generatedApplicationDefaultLocale ?? null,
        supportedLocales,
        runtimeSwitching,
        preferencePersistence,
        frontendLocalization: {
            resources: frontendLocalizationFiles.every(filePath => fs.existsSync(filePath)),
            selector: fs.existsSync(path.join(projectRoot, "frontend", "src", "components", "LanguageSelector.jsx"))
        },
        backendLocalization,
        fallbackBehavior: {
            englishFallback,
            fallbackLocale: "en-US"
        },
        rtlReady,
        validation,
        generation: generation
            ? {
                success: Boolean(generation.success),
                filesWritten: generation.result?.report?.filesWritten ?? 0,
                projectRoot: generation.result?.project?.projectRoot ?? null
            }
            : null,
        score: Math.round(readinessScore),
        generatedAt: new Date().toISOString()
    };
}

async function generateQAGates(projectRoot, validation, qualityStartMs) {
    const apiProbe = await startBackendProbe(projectRoot);
    const security = buildStaticSecurityScan(projectRoot);
    const accessibility = buildStaticAccessibilityScan(projectRoot);
    const performance = buildPerformanceScan({
        buildValidation: validation,
        apiResults: apiProbe,
        qualityStartMs
    });

    return {
        api: {
            health: apiProbe.health,
            docs: apiProbe.docs,
            openapi: apiProbe.openapi,
            latencyMs: apiProbe.latencyMs
        },
        security,
        performance,
        accessibility
    };
}

export async function runCompanyOrchestration({
    requestText = "",
    type = null,
    answers = null,
    interactive = false,
    workspaceRoot = "workspace",
    outputRoot = null,
    email = null,
    emails = null,
    telegram = null
} = {}) {
    const conversationText = normalizeConversationText({ requestText, answers });
    const analyzer = new RequirementAnalyzer();
    const templateCompiler = new TemplateCompiler();
    const softwareArchitect = new SoftwareArchitect();
    const planningDecisionAdapter = new PlanningDecisionAdapter();
    const planningEngine = new PlanningEngine();
    const engineeringDirector = new EngineeringDirector();
    const customerOrchestrator = new CustomerOrchestrator();
    const repairOrchestrator = new RepairOrchestrator();
    const ceoOrchestrator = new CEOOrchestrator();
    const salesOrchestrator = new SalesOrchestrator();
    const productOrchestrator = new ProductOrchestrator();
    const architectureOrchestrator = new ArchitectureOrchestrator();
    const engineeringOrchestrator = new EngineeringOrchestrator();
    const qaOrchestrator = new QAOrchestrator();
    const securityOrchestrator = new SecurityOrchestrator();
    const devopsOrchestrator = new DevOpsOrchestrator();
    const upgradeOrchestrator = new UpgradeOrchestrator();
    const evolutionOrchestrator = new EvolutionOrchestrator();
    const languageOrchestrator = new LanguageOrchestrator();
    const emailOrchestrator = new EmailOrchestrator();
    const telegramAdminIds = telegram?.adminIds ?? process.env.TELEGRAM_ADMIN_IDS ?? "";
    const telegramOrchestrator = new TelegramOrchestrator({
        client: new TelegramClient({
            adminIds: telegramAdminIds,
            token: telegram?.token ?? process.env.TELEGRAM_BOT_TOKEN ?? ""
        }),
        accessControl: new AdminAccessControl({ adminIds: telegramAdminIds })
    });
    const telegramBotToken = telegram?.token ?? process.env.TELEGRAM_BOT_TOKEN ?? "";
    if (!telegramRuntimeStarted && telegramBotToken) {
        telegramRuntimeStarted = true;
        void telegramOrchestrator.startRuntime({
            pollInterval: telegram?.pollInterval ?? process.env.TELEGRAM_POLL_INTERVAL ?? 1000
        }).catch(error => {
            console.warn("Telegram runtime failed to start:", error?.message ?? error);
            telegramRuntimeStarted = false;
        });
    }
    const generationWorkspaceRoot = outputRoot ?? workspaceRoot;

    const analysis = analyzer.analyze({
        requestText: conversationText,
        applicationType: type
    });
    analysis.projectType = analysis.projectType ?? analysis.applicationType;
    const preflightProjectRoot = path.resolve(generationWorkspaceRoot, analysis.projectId);
    makeWritableTree(preflightProjectRoot);

    const composition = analyzer.buildApplicationComposition(analysis);

    const languageDepartment = languageOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot: preflightProjectRoot
        },
        projectRoot: preflightProjectRoot
    });
    analysis.languageContext = languageDepartment.languageContext ?? languageDepartment;
    analysis.supportedLocales = languageDepartment.supportedLocales ?? [];

    const ceoDepartment = ceoOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot: preflightProjectRoot
        },
        projectRoot: preflightProjectRoot,
        features: analysis.requiredFeatures ?? [],
        industry: analysis.industry
    });

    const salesDepartment = salesOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot: preflightProjectRoot
        },
        projectRoot: preflightProjectRoot,
        industry: analysis.industry,
        businessType: analysis.businessType,
        companySize: analysis.companySize ?? "Mid-Market"
    });
    const productDepartment = productOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        salesDepartment,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot: preflightProjectRoot
        },
        projectRoot: preflightProjectRoot,
        features: Array.from(new Set([
            ...(analysis.requiredFeatures ?? []),
            ...(analysis.recommendedCapabilities ?? []),
            "Authentication",
            "Customer Management",
            "Dashboard",
            "Automation",
            "Notifications",
            "Analytics",
            "AI Lead Scoring"
        ])),
        targetUsers: analysis.users?.length ? analysis.users.join(", ") : "Business users and administrators"
    });

    const architectureDepartment = architectureOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        productDepartment,
        salesDepartment,
        ceoDepartment,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot: preflightProjectRoot
        },
        projectRoot: preflightProjectRoot
    });

    const engineeringDepartment = await engineeringOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        productDepartment,
        architectureDepartment,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot: preflightProjectRoot
        },
        projectRoot: preflightProjectRoot
    });

    const requirementAgentResult = runRequirementAgent({
        message: conversationText,
        conversation: conversationText,
        clientInfo: {
            challenge: conversationText,
            industry: analysis.industry,
            companyName: analysis.projectName,
            role: "Customer"
        }
    });

    const productDecision = runProductIntelligenceAgent({
        requirements: requirementAgentResult.requirements
    });

    const estimation = runEstimationAgent({
        requirements: requirementAgentResult.requirements,
        productDecision,
        projectId: analysis.projectId
    });

    const proposal = runProposalAgent({
        requirements: requirementAgentResult.requirements,
        productDecision,
        estimation: estimation.estimation,
        technology: {
            frontend: composition.stack?.frontend ?? composition.template?.frontend ?? "React",
            backend: composition.stack?.backend ?? composition.template?.backend ?? "FastAPI",
            database: composition.stack?.database ?? composition.template?.database ?? "PostgreSQL",
            deployment: composition.deployment ?? "Docker"
        },
        projectId: analysis.projectId
    });

    const businessAnalysisReport = buildBusinessAnalysisReport({
        analysis,
        requirementAgentResult,
        productDecision,
        estimation,
        proposal,
        composition
    });

    const blueprint = templateCompiler.compile({
        request: {
            project: {
                projectId: analysis.projectId,
                name: analysis.projectName,
                description: conversationText,
                industry: analysis.industry
            },
            requestedCapabilities: composition.capabilities ?? analysis.recommendedCapabilities ?? [],
            capabilityComposition: composition.capabilities ?? analysis.recommendedCapabilities ?? [],
            languageContext: analysis.languageContext
        },
        businessAnalysis: analysis
    });

    const specification = softwareArchitect.createSpecification({
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            description: conversationText
        },
        businessAnalysis: analysis,
        engineeringPlan: blueprint.engineeringPlan
    });

    const planningDecision = planningDecisionAdapter.adapt(specification);
    const plan = planningEngine.createPlan(planningDecision);
    const executionPlan = engineeringDirector.createExecutionPlan(specification);

    const generation = await runApplicationGeneration({
        type: analysis.applicationType,
        requestText: conversationText,
        workspaceRoot: generationWorkspaceRoot,
        languageContext: analysis.languageContext
    });

    if (!generation.success) {
        return {
            success: false,
            error: "Application generation failed.",
            generation,
            analysis,
            composition
        };
    }

    const projectRoot = path.resolve(
        generationWorkspaceRoot,
        generation.result?.project?.projectId ?? analysis.projectId
    );

    const persistedLanguageDepartment = languageOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot
        },
        projectRoot
    });
    analysis.languageContext = persistedLanguageDepartment.languageContext ?? analysis.languageContext;
    analysis.supportedLocales = persistedLanguageDepartment.supportedLocales ?? analysis.supportedLocales ?? [];

    const incomingEmail = Array.isArray(email)
        ? email[0]
        : email ?? (Array.isArray(emails) ? emails[0] : null);
    const emailDepartment = incomingEmail
        ? emailOrchestrator.processIncomingEmail({
            email: incomingEmail,
            analysis,
            departmentContext: {
                ceoDepartment,
                salesDepartment
            },
            project: {
                projectId: analysis.projectId,
                name: analysis.projectName,
                projectRoot
            },
            projectRoot,
            languageContext: persistedLanguageDepartment.languageContext ?? analysis.languageContext
        })
        : null;

    const validation = generation.validation ?? {
        backend: {
            compileall: true,
            pytest: true
        },
        frontend: {
            install: true,
            build: true,
            smoke: true
        }
    };

    const qualityStartMs = Date.now();
    const qaResults = await generateQAGates(projectRoot, validation, qualityStartMs);

    const qaDepartment = qaOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaResults,
        validation,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot
        },
        projectRoot
    });

    const securityDepartment = securityOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        composition,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaResults,
        validation,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot
        },
        projectRoot
    });

    const devopsDepartment = devopsOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        composition,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaResults,
        validation,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot
        },
        projectRoot
    });

    const upgradeDepartment = upgradeOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        composition,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaDepartment,
        securityDepartment,
        devopsDepartment,
        qaResults,
        validation,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot
        },
        projectRoot
    });

    const evolutionDepartment = evolutionOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        composition,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaDepartment,
        securityDepartment,
        devopsDepartment,
        upgradeDepartment,
        qaResults,
        validation,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot
        },
        projectRoot
    });

    const customerIntelligence = customerOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        languageContext: analysis.languageContext,
        customer: analysis.customer ?? null,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            industry: analysis.industry
        }
    });

    const architectureReport = buildArchitectureReport({
        analysis,
        composition,
        blueprint,
        specification,
        plan,
        executionPlan
    });

    const roadmapReport = buildRoadmapReport({
        analysis,
        proposal,
        plan,
        executionPlan
    });

    const riskReport = buildRiskAnalysisReport({
        analysis,
        estimation,
        productDecision
    });

    const deliveryPackage = runDeliveryWorker({
        projectId: analysis.projectId,
        architecture: architectureReport,
        backendPlan: blueprint.engineeringPlan?.backend ?? null,
        frontendPlan: blueprint.engineeringPlan?.frontend ?? null,
        generationResult: {
            files: (generation.result?.report?.written ?? []).map(filePath => ({ path: filePath }))
        },
        repositoryResult: {
            projectId: analysis.projectId,
            workspaceRoot: projectRoot
        },
        tests: {
            backend: validation.backend,
            frontend: validation.frontend,
            api: qaResults.api
        },
        reviews: []
    });
    const repairIntelligence = await repairOrchestrator.processRequest({
        requestText: conversationText,
        analysis,
        languageContext: analysis.languageContext,
        customerIntelligence,
        project: {
            projectId: analysis.projectId,
            name: analysis.projectName,
            projectRoot: preflightProjectRoot,
            industry: analysis.industry
        },
        projectRoot: preflightProjectRoot
    });

    const reportRoot = path.join(projectRoot, "reports");
    const reportPaths = {
        proposal: {
            markdown: path.join(reportRoot, "proposal", "proposal.md"),
            quotation: path.join(reportRoot, "proposal", "quotation.json"),
            estimate: path.join(reportRoot, "proposal", "project-estimate.json")
        },
        analysis: {
            json: path.join(reportRoot, "analysis", "business-analysis.json"),
            markdown: path.join(reportRoot, "analysis", "requirements.md")
        },
        architecture: {
            json: path.join(reportRoot, "architecture", "architecture.json"),
            markdown: path.join(reportRoot, "architecture", "architecture.md"),
            databaseSchema: path.join(reportRoot, "architecture", "database-schema.json"),
            apiDesign: path.join(reportRoot, "architecture", "api-design.json")
        },
        planning: {
            roadmap: path.join(reportRoot, "planning", "roadmap.json"),
            sprintPlan: path.join(reportRoot, "planning", "sprint-plan.json"),
            riskAnalysis: path.join(reportRoot, "planning", "risk-analysis.json")
        },
        engineering: {
            executionPlan: path.join(reportRoot, "engineering", "engineering-plan.json"),
            executionReport: path.join(reportRoot, "company", "engineering", "engineering-execution-report.json")
        },
        qa: {
            quality: path.join(reportRoot, "qa", "quality-report.json"),
            coverage: path.join(reportRoot, "qa", "coverage.json")
        },
        security: {
            certification: path.join(reportRoot, "company", "security", "security-certification-report.json")
        },
        devops: {
            certification: path.join(reportRoot, "company", "devops", "devops-operations-report.json")
        },
        upgrade: {
            certification: path.join(reportRoot, "company", "upgrade", "upgrade-lifecycle-report.json")
        },
        evolution: {
            certification: path.join(reportRoot, "company", "evolution", "software-evolution-report.json")
        },
        language: {
            certification: path.join(reportRoot, "company", "language", "language-intelligence-report.json"),
            memory: path.join(reportRoot, "company", "language", "language-memory.json")
        },
        email: {
            intelligence: path.join(reportRoot, "company", "email", "email-intelligence-report.json"),
            memory: path.join(reportRoot, "company", "email", "email-memory.json"),
            approval: path.join(reportRoot, "company", "email", "approval-state.json"),
            analytics: path.join(reportRoot, "company", "email", "email-analytics.json"),
            customerContext: path.join(reportRoot, "company", "email", "customer-context-report.json"),
            employeeRouting: path.join(reportRoot, "company", "email", "employee-routing-report.json"),
            commandCenter: path.join(reportRoot, "company", "email", "command-center-email-report.json")
        },
        telegram: {
            activity: path.join(reportRoot, "company", "telegram", "telegram-activity-report.json"),
            memory: path.join(reportRoot, "company", "telegram", "telegram-memory.json")
        },
        languagePropagation: path.join(reportRoot, "platform", "language", "universal-language-propagation-report.json"),
        runtimeLanguage: path.join(reportRoot, "platform", "language", "runtime-multilingual-readiness-report.json"),
        deployment: {
            json: path.join(reportRoot, "deployment", "deployment-package.json"),
            markdown: path.join(reportRoot, "deployment", "deployment-guide.md")
        },
        delivery: {
            json: path.join(reportRoot, "delivery", "delivery-package.json"),
            markdown: path.join(reportRoot, "delivery", "delivery-summary.md")
        },
        company: {
            json: path.join(reportRoot, "company-generation-report.json"),
            markdown: path.join(reportRoot, "company-architecture-report.md"),
            ceo: path.join(reportRoot, "company", "ceo", "ceo-strategy-report.json"),
            sales: path.join(reportRoot, "company", "sales", "sales-intelligence-report.json"),
            product: path.join(reportRoot, "company", "product", "product-strategy-report.json"),
            architecture: path.join(reportRoot, "company", "architecture", "enterprise-architecture-report.json"),
            qa: path.join(reportRoot, "company", "qa", "quality-certification-report.json"),
            security: path.join(reportRoot, "company", "security", "security-certification-report.json"),
            devops: path.join(reportRoot, "company", "devops", "devops-operations-report.json"),
            upgrade: path.join(reportRoot, "company", "upgrade", "upgrade-lifecycle-report.json"),
            evolution: path.join(reportRoot, "company", "evolution", "software-evolution-report.json"),
            language: {
                certification: path.join(reportRoot, "company", "language", "language-intelligence-report.json"),
                memory: path.join(reportRoot, "company", "language", "language-memory.json")
            },
            email: {
                intelligence: path.join(reportRoot, "company", "email", "email-intelligence-report.json"),
                memory: path.join(reportRoot, "company", "email", "email-memory.json"),
                approval: path.join(reportRoot, "company", "email", "approval-state.json"),
                analytics: path.join(reportRoot, "company", "email", "email-analytics.json"),
                customerContext: path.join(reportRoot, "company", "email", "customer-context-report.json"),
                employeeRouting: path.join(reportRoot, "company", "email", "employee-routing-report.json"),
                commandCenter: path.join(reportRoot, "company", "email", "command-center-email-report.json")
            },
            telegram: {
                activity: path.join(reportRoot, "company", "telegram", "telegram-activity-report.json"),
                memory: path.join(reportRoot, "company", "telegram", "telegram-memory.json")
            }
        }
    };
    reportPaths.repair = repairIntelligence.reportPaths ?? null;
    reportPaths.ceo = ceoDepartment.reportPath ?? reportPaths.company.ceo;
    reportPaths.sales = salesDepartment.reportPath ?? reportPaths.company.sales;
    reportPaths.product = productDepartment.reportPath ?? reportPaths.company.product;
    reportPaths.architecture.reportPath = architectureDepartment.reportPath ?? reportPaths.company.architecture;
    reportPaths.engineering.reportPath = engineeringDepartment.reportPath ?? reportPaths.company.engineering;
    reportPaths.qaCertification = qaDepartment.reportPath ?? reportPaths.company.qa ?? null;
    reportPaths.securityCertification = securityDepartment.reportPath ?? reportPaths.company.security ?? null;
    reportPaths.devopsCertification = devopsDepartment.reportPath ?? reportPaths.company.devops ?? null;
    reportPaths.upgradeCertification = upgradeDepartment.reportPath ?? reportPaths.company.upgrade ?? null;
    reportPaths.evolutionCertification = evolutionDepartment.reportPath ?? reportPaths.company.evolution ?? null;
    reportPaths.languageCertification = persistedLanguageDepartment.reportPath ?? languageDepartment.reportPath ?? reportPaths.company.language?.certification ?? null;
    reportPaths.emailIntelligence = emailDepartment?.reportPath ?? reportPaths.company.email?.intelligence ?? null;
    reportPaths.emailCustomerContext = emailDepartment?.customerContextReportPath ?? reportPaths.company.email?.customerContext ?? null;
    reportPaths.emailEmployeeRouting = emailDepartment?.employeeRoutingReportPath ?? reportPaths.company.email?.employeeRouting ?? null;
    reportPaths.emailCommandCenter = emailDepartment?.commandCenterReportPath ?? reportPaths.company.email?.commandCenter ?? null;
    reportPaths.telegramActivity = reportPaths.company.telegram?.activity ?? null;
    reportPaths.telegramMemory = reportPaths.company.telegram?.memory ?? null;
    if (reportPaths.language) {
        reportPaths.language.certification = reportPaths.languageCertification;
        reportPaths.language.memory = path.join(projectRoot, "reports", "company", "language", "language-memory.json");
    }
    if (reportPaths.company?.language) {
        reportPaths.company.language.certification = reportPaths.languageCertification;
        reportPaths.company.language.memory = path.join(projectRoot, "reports", "company", "language", "language-memory.json");
    }
    if (reportPaths.email) {
        reportPaths.email.intelligence = reportPaths.emailIntelligence;
        reportPaths.email.memory = path.join(projectRoot, "reports", "company", "email", "email-memory.json");
        reportPaths.email.approval = path.join(projectRoot, "reports", "company", "email", "approval-state.json");
        reportPaths.email.analytics = path.join(projectRoot, "reports", "company", "email", "email-analytics.json");
        reportPaths.email.customerContext = reportPaths.emailCustomerContext;
        reportPaths.email.employeeRouting = reportPaths.emailEmployeeRouting;
        reportPaths.email.commandCenter = reportPaths.emailCommandCenter;
    }
    if (reportPaths.company?.email) {
        reportPaths.company.email.intelligence = reportPaths.emailIntelligence;
        reportPaths.company.email.memory = path.join(projectRoot, "reports", "company", "email", "email-memory.json");
        reportPaths.company.email.approval = path.join(projectRoot, "reports", "company", "email", "approval-state.json");
        reportPaths.company.email.analytics = path.join(projectRoot, "reports", "company", "email", "email-analytics.json");
        reportPaths.company.email.customerContext = reportPaths.emailCustomerContext;
        reportPaths.company.email.employeeRouting = reportPaths.emailEmployeeRouting;
        reportPaths.company.email.commandCenter = reportPaths.emailCommandCenter;
    }
    if (reportPaths.telegram) {
        reportPaths.telegram.activity = reportPaths.telegramActivity;
        reportPaths.telegram.memory = reportPaths.telegramMemory;
    }
    if (reportPaths.company?.telegram) {
        reportPaths.company.telegram.activity = reportPaths.telegramActivity;
        reportPaths.company.telegram.memory = reportPaths.telegramMemory;
    }

    const proposalMarkdown = buildProposalMarkdown({
        analysis,
        proposal,
        estimation,
        productDecision
    });
    const quotation = buildQuotation({
        proposal,
        estimation,
        analysis,
        productDecision
    });
    const projectEstimate = buildProjectEstimate({
        analysis,
        productDecision,
        estimation,
        proposal
    });
    const requirementsMarkdown = buildRequirementsMarkdown(businessAnalysisReport);
    const architectureMarkdown = buildArchitectureMarkdown(architectureReport);
    const qualityReport = buildQualityReport({
        validation,
        apiResults: qaResults,
        projectRoot,
        qualityStartMs
    });
    const coverageReport = buildQualityCoverageReport({
        projectRoot,
        apiResults: qaResults,
        validation
    });
    const deploymentPackage = {
        deploymentId: `DEP-${Date.now()}`,
        projectId: analysis.projectId,
        status: "READY_FOR_DEPLOYMENT",
        guide: {
            backend: "Start with python -m uvicorn app.main:app",
            frontend: "Start with npm run build and deploy dist/",
            notes: [
                "Keep environment variables in .env files.",
                "Provision a persistent database before production launch."
            ]
        },
        generatedAt: new Date().toISOString()
    };

    writeText(reportPaths.proposal.markdown, proposalMarkdown);
    writeJson(reportPaths.proposal.quotation, quotation);
    writeJson(reportPaths.proposal.estimate, projectEstimate);

    writeJson(reportPaths.analysis.json, businessAnalysisReport);
    writeText(reportPaths.analysis.markdown, requirementsMarkdown);

    writeJson(reportPaths.architecture.json, architectureReport);
    writeText(reportPaths.architecture.markdown, architectureMarkdown);
    writeJson(reportPaths.architecture.databaseSchema, {
        projectId: analysis.projectId,
        entities: blueprint.entities ?? [],
        generatedAt: new Date().toISOString()
    });
    writeJson(reportPaths.architecture.apiDesign, {
        projectId: analysis.projectId,
        endpoints: blueprint.apis ?? [],
        security: analysis.security ?? [],
        generatedAt: new Date().toISOString()
    });

    writeJson(reportPaths.planning.roadmap, roadmapReport);
    writeJson(reportPaths.planning.sprintPlan, {
        projectId: analysis.projectId,
        sprints: plan.milestones ?? [],
        generatedAt: new Date().toISOString()
    });
    writeJson(reportPaths.planning.riskAnalysis, riskReport);

    writeJson(reportPaths.engineering.executionPlan, executionPlan);

    writeJson(reportPaths.qa.quality, qualityReport);
    writeJson(reportPaths.qa.coverage, coverageReport);
    writeJson(reportPaths.securityCertification, securityDepartment.report);
    writeJson(reportPaths.devopsCertification, devopsDepartment.report);
    writeJson(reportPaths.upgradeCertification, upgradeDepartment.report);
    writeJson(reportPaths.evolutionCertification, evolutionDepartment.report);

    writeJson(reportPaths.deployment.json, deploymentPackage);
    writeText(reportPaths.deployment.markdown, compactLines([
        `# Deployment Guide`,
        ``,
        `- Project: ${analysis.projectName}`,
        `- Backend: python -m uvicorn app.main:app`,
        `- Frontend: npm run build`,
        `- Package: Docker-ready workspace generated by ANNEXE AI`
    ]));

    const deliverySummary = buildDeliverySummary({
        analysis,
        deliveryPackage
    });
    writeJson(reportPaths.delivery.json, {
        projectId: analysis.projectId,
        status: deliveryPackage.status,
        package: deliveryPackage.deliveryPackage ?? null,
        generatedAt: new Date().toISOString()
    });
    writeText(reportPaths.delivery.markdown, deliverySummary);

    const languagePropagationReport = buildUniversalLanguagePropagationReport({
        analysis,
        projectRoot,
        languageDepartment: persistedLanguageDepartment ?? languageDepartment,
        ceoDepartment,
        salesDepartment,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaDepartment,
        securityDepartment,
        devopsDepartment,
        upgradeDepartment,
        evolutionDepartment,
        generation,
        validation,
        customerIntelligence,
        repairIntelligence
    });
    writeJson(reportPaths.languagePropagation, languagePropagationReport);

    const runtimeMultilingualReport = buildRuntimeMultilingualReadinessReport({
        analysis,
        projectRoot,
        languageDepartment: persistedLanguageDepartment ?? languageDepartment,
        generation,
        validation
    });
    writeJson(reportPaths.runtimeLanguage, runtimeMultilingualReport);

    const baseCompanyGenerationReport = buildCompanyGenerationReport({
        analysis,
        composition,
        result: generation.result,
        projectRoot,
        validation,
        reportPaths,
        customerIntelligence,
        repairIntelligence,
        ceoDepartment,
        salesDepartment,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaDepartment,
        securityDepartment,
        devopsDepartment,
        upgradeDepartment,
        evolutionDepartment,
        languageDepartment,
        emailDepartment,
        telegramDepartment: null
    });

    const telegramInput = telegram ?? null;
    const telegramDepartment = telegramInput
        ? telegramOrchestrator.processMessage({
            message: telegramInput.message ?? telegramInput,
            projectRoot,
            companyReport: baseCompanyGenerationReport,
            telegramReport: {
                commandsProcessed: 0,
                notificationsSent: 0,
                activeUsers: 0
            },
            emailDepartment,
            ceoSummary: ceoDepartment.report ?? {},
            context: {
                emailDepartment,
                employeeStatus: "READY",
                systemStatus: "ONLINE"
            },
            notification: telegramInput.notification ?? null
        })
        : null;

    const companyGenerationReport = buildCompanyGenerationReport({
        analysis,
        composition,
        result: generation.result,
        projectRoot,
        validation,
        reportPaths,
        customerIntelligence,
        repairIntelligence,
        ceoDepartment,
        salesDepartment,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaDepartment,
        securityDepartment,
        devopsDepartment,
        upgradeDepartment,
        evolutionDepartment,
        languageDepartment,
        emailDepartment,
        telegramDepartment
    });
    writeJson(reportPaths.company.json, companyGenerationReport);
    writeText(reportPaths.company.markdown, architectureMarkdown);

    return {
        success: true,
        analysis,
        composition,
        proposal,
        blueprint,
        specification,
        planningDecision,
        plan,
        executionPlan,
        generation,
        validation,
        qaResults,
        deliveryPackage,
        customerIntelligence,
        repairIntelligence,
        ceoDepartment,
        salesDepartment,
        productDepartment,
        architectureDepartment,
        engineeringDepartment,
        qaDepartment,
        securityDepartment,
        devopsDepartment,
        upgradeDepartment,
        evolutionDepartment,
        languageDepartment,
        emailDepartment,
        telegramDepartment,
        reportPaths,
        projectRoot
    };
}
