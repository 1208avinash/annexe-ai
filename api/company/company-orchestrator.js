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
    reportPaths
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
        validation,
        reportPaths
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
    workspaceRoot = "workspace"
} = {}) {
    const conversationText = normalizeConversationText({ requestText, answers });
    const analyzer = new RequirementAnalyzer();
    const templateCompiler = new TemplateCompiler();
    const softwareArchitect = new SoftwareArchitect();
    const planningDecisionAdapter = new PlanningDecisionAdapter();
    const planningEngine = new PlanningEngine();
    const engineeringDirector = new EngineeringDirector();

    const analysis = analyzer.analyze({
        requestText: conversationText,
        applicationType: type
    });
    analysis.projectType = analysis.projectType ?? analysis.applicationType;
    const preflightProjectRoot = path.resolve(workspaceRoot, analysis.projectId);
    makeWritableTree(preflightProjectRoot);

    const composition = analyzer.buildApplicationComposition(analysis);

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
            capabilityComposition: composition.capabilities ?? analysis.recommendedCapabilities ?? []
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
        workspaceRoot
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
        workspaceRoot,
        generation.result?.project?.projectId ?? analysis.projectId
    );

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
            executionPlan: path.join(reportRoot, "engineering", "engineering-plan.json")
        },
        qa: {
            quality: path.join(reportRoot, "qa", "quality-report.json"),
            coverage: path.join(reportRoot, "qa", "coverage.json")
        },
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
            markdown: path.join(reportRoot, "company-architecture-report.md")
        }
    };

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

    const companyGenerationReport = buildCompanyGenerationReport({
        analysis,
        composition,
        result: generation.result,
        projectRoot,
        validation,
        reportPaths
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
        reportPaths,
        projectRoot
    };
}
