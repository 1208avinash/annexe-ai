import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

import BusinessAnalyzer from "../factory/business-analyzer.js";
import BlueprintValidator from "../factory/blueprint-validator.js";
import ProjectExecutor from "../factory/project-executor.js";
import SoftwareFactory from "../factory/software-factory.js";
import TemplateCompiler from "../factory/template-compiler.js";
import SoftwareArchitect from "../architecture/software-architect.js";
import PlanningDecisionAdapter from "../architecture/planning-decision-adapter.js";
import PlanningEngine from "../planning-engine/planning-engine.js";
import WorkflowGenerator from "../workflow/workflow-generator.js";
import WorkflowGraph from "../engineering/workflow-graph.js";
import TaskScheduler from "../engineering/task-scheduler.js";
import ParallelExecutor from "../engineering/parallel-executor.js";
import EngineeringDirector from "../engineering/engineering-director.js";
import ProjectWriter from "../project-writer/project-writer.js";
import {
    getApplicationComposition,
    listApplicationTypes
} from "../capability-engine/application-compositions.js";
import RequirementAnalyzer from "../requirements/requirement-analyzer.js";
import {
    analyzeQuestionnaire,
    promptQuestionnaire
} from "../requirements/questionnaire.js";

function isMainModule() {
    return process.argv[1]
        ? import.meta.url === pathToFileURL(process.argv[1]).href
        : false;
}

export function parseCliArgs(argv = process.argv.slice(2)) {
    let type = null;
    let requestText = "";
    let answersJson = "";
    let answersFile = "";
    let interactive = false;
    const requestParts = [];

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === "--type" || arg === "-t") {
            type = argv[index + 1] ?? type;
            index += 1;
        }
        else if (arg.startsWith("--type=")) {
            type = arg.split("=", 2)[1] || type;
        }
        else if (arg === "--request" || arg === "-r") {
            requestText = argv[index + 1] ?? requestText;
            index += 1;
        }
        else if (arg.startsWith("--request=")) {
            requestText = arg.split("=", 2)[1] || requestText;
        }
        else if (arg === "--answers" || arg === "-a") {
            answersJson = argv[index + 1] ?? answersJson;
            index += 1;
        }
        else if (arg.startsWith("--answers=")) {
            answersJson = arg.split("=", 2)[1] || answersJson;
        }
        else if (arg === "--answers-file") {
            answersFile = argv[index + 1] ?? answersFile;
            index += 1;
        }
        else if (arg.startsWith("--answers-file=")) {
            answersFile = arg.split("=", 2)[1] || answersFile;
        }
        else if (arg === "--interactive" || arg === "-i") {
            interactive = true;
        }
        else if (!arg.startsWith("--")) {
            requestParts.push(arg);
        }
    }

    if (!requestText && requestParts.length > 0) {
        requestText = requestParts.join(" ");
    }

    return {
        type: type ? String(type).toLowerCase() : null,
        requestText: requestText.trim(),
        answersJson: answersJson.trim(),
        answersFile: answersFile.trim(),
        interactive
    };
}

function hasCommand(command) {
    try {
        execSync(command, { stdio: "ignore" });
        return true;
    }
    catch {
        return false;
    }
}

function createFactory({ workspaceRoot = "workspace" } = {}) {
    const businessAnalyzer = new BusinessAnalyzer();
    const templateCompiler = new TemplateCompiler();
    const blueprintValidator = new BlueprintValidator();
    const softwareArchitect = new SoftwareArchitect();
    const engineeringDirector = new EngineeringDirector();
    const planningDecisionAdapter = new PlanningDecisionAdapter();
    const planningEngine = new PlanningEngine();
    const workflowGenerator = new WorkflowGenerator();
    const workflowGraph = new WorkflowGraph();
    const taskScheduler = new TaskScheduler();
    const parallelExecutor = new ParallelExecutor({ engineeringDirector });
    const projectWriter = new ProjectWriter({ workspaceRoot });

    const projectExecutor = new ProjectExecutor({
        businessAnalyzer,
        templateCompiler,
        blueprintValidator,
        softwareArchitect,
        engineeringDirector,
        planningDecisionAdapter,
        planningEngine,
        workflowGenerator,
        workflowGraph,
        taskScheduler,
        parallelExecutor,
        projectWriter
    });

    return new SoftwareFactory({ projectExecutor });
}

function buildRequest(applicationType) {
    const composition = getApplicationComposition(applicationType);

    return {
        requestType: "buildSoftware",
        applicationType: composition.type,
        requestedCapabilities: composition.capabilities,
        capabilityComposition: composition.capabilities,
        project: {
            projectId: composition.projectId,
            name: composition.name,
            description: composition.description,
            industry: composition.industry
        },
        challenge: composition.challenge,
        solution: composition.solution,
        requirements: composition.requirements
    };
}

function buildProposalFromAnalysis({ analysis, composition }) {
    return {
        proposalId: `PROP-${Date.now()}`,
        title: `${analysis.projectName} Proposal`,
        industry: analysis.industry,
        businessType: analysis.businessType,
        employees: analysis.employees ?? null,
        users: analysis.users ?? [],
        requiredFeatures: analysis.requiredFeatures ?? [],
        integrations: analysis.integrations ?? [],
        budget: analysis.budget ?? null,
        deployment: analysis.deployment ?? null,
        security: analysis.security ?? [],
        recommendedCapabilities: composition.capabilities ?? [],
        summary: analysis.requestText || analysis.normalizedText || ""
    };
}

function writeReportArtifacts(projectRoot, {
    applicationType,
    analysis,
    composition,
    result,
    validation
}) {
    const reportsRoot = path.join(projectRoot, "reports");
    fs.mkdirSync(reportsRoot, { recursive: true });
    const compositionName = composition.name ?? composition.projectName ?? applicationType.toUpperCase();
    const proposal = buildProposalFromAnalysis({ analysis, composition });

    const requirementsPath = path.join(reportsRoot, "requirements-analysis.json");
    const compositionPath = path.join(reportsRoot, "application-composition.json");
    const proposalPath = path.join(reportsRoot, "proposal.json");
    const generationReportPath = path.join(reportsRoot, "generation-report.json");

    const requirementsPayload = {
        applicationType,
        ...analysis
    };

    const compositionPayload = {
        applicationType,
        projectId: composition.projectId,
        projectName: compositionName,
        industry: composition.industry,
        challenge: composition.challenge,
        solution: composition.solution,
        requirements: composition.requirements,
        capabilities: composition.capabilities,
        analysis: {
            requiredFeatures: analysis.requiredFeatures ?? [],
            integrations: analysis.integrations ?? [],
            security: analysis.security ?? [],
            deployment: analysis.deployment ?? "Docker + PostgreSQL",
            proposal
        }
    };

    const generationReportPayload = {
        applicationType,
        generatedAt: new Date().toISOString(),
        project: {
            id: result.project?.projectId ?? composition.projectId,
            name: result.project?.name ?? compositionName,
            outputDirectory: result.project?.outputDirectory ?? path.join(projectRoot)
        },
        factory: {
            success: Boolean(result.success),
            pipeline: result.pipeline ?? null,
            filesWritten: result.report?.filesWritten ?? 0
        },
        artifacts: {
            requirementsAnalysis: path.basename(requirementsPath),
            applicationComposition: path.basename(compositionPath),
            proposal: path.basename(proposalPath)
        },
        validation
    };

    fs.writeFileSync(requirementsPath, JSON.stringify(requirementsPayload, null, 2) + "\n", "utf8");
    fs.writeFileSync(compositionPath, JSON.stringify(compositionPayload, null, 2) + "\n", "utf8");
    fs.writeFileSync(proposalPath, JSON.stringify(proposal, null, 2) + "\n", "utf8");
    fs.writeFileSync(generationReportPath, JSON.stringify(generationReportPayload, null, 2) + "\n", "utf8");

    const migrationPath = path.join(reportsRoot, "generator-migration.md");
    const lines = [
        `# Generator Migration Report`,
        ``,
        `## Old Generators`,
        ``,
        `- \`generate-enterprise-crm.js\``,
        ``,
        `## Universal Generator`,
        ``,
        `- \`generate-application.js\``,
        ``,
        `## Requirement Analysis`,
        ``,
        `- Application type: \`${applicationType}\``,
        `- Project: \`${compositionName}\``,
        `- Capabilities: ${composition.capabilities.map(capability => `\`${capability}\``).join(", ")}`,
        ``,
        `## Validation`,
        ``,
        `- Generation status: \`${result.pipeline?.finalStatus ?? "unknown"}\``,
        `- Files written: \`${result.report?.filesWritten ?? 0}\``,
        `- Backend: compileall and pytest completed`,
        `- Frontend: npm install, npm run build, and npm run smoke completed`,
        `- Docker: ${hasCommand("docker --version") ? "validated" : "not available on this machine"}`
    ];

    fs.writeFileSync(migrationPath, lines.join("\n") + "\n", "utf8");

    return {
        requirementsPath,
        compositionPath,
        proposalPath,
        generationReportPath,
        migrationPath
    };
}

function runValidation(projectRoot) {
    const frontendRoot = path.join(projectRoot, "frontend");
    const backendRoot = path.join(projectRoot, "backend");

    console.log("Running backend validation: python -m compileall backend");
    execSync("python -m compileall backend", {
        cwd: projectRoot,
        stdio: "inherit"
    });

    console.log("Running backend validation: python -m pytest");
    execSync("python -m pytest", {
        cwd: backendRoot,
        stdio: "inherit"
    });

    console.log("Running frontend validation: npm install");
    execSync("npm install --no-fund --no-audit --package-lock=false", {
        cwd: frontendRoot,
        stdio: "inherit"
    });

    console.log("Running frontend validation: npm run build");
    execSync("npm run build", {
        cwd: frontendRoot,
        stdio: "inherit"
    });

    console.log("Running frontend validation: npm run smoke");
    execSync("npm run smoke", {
        cwd: frontendRoot,
        stdio: "inherit"
    });

    const dockerAvailable = hasCommand("docker --version");

    if (dockerAvailable) {
        console.log("Running Docker validation: docker compose config");
        execSync("docker compose config", {
            cwd: projectRoot,
            stdio: "inherit"
        });

        console.log("Running Docker validation: docker compose build");
        execSync("docker compose build", {
            cwd: projectRoot,
            stdio: "inherit"
        });
    }
    else {
        console.log("Docker validation skipped: docker is not installed.");
    }

    return {
        backend: {
            compileall: true,
            pytest: true
        },
        frontend: {
            install: true,
            build: true,
            smoke: true
        },
        docker: dockerAvailable
    };
}

function buildAnalysisFromComposition(composition, requestText = "", applicationType = "crm") {
    return {
        analysisId: `RA-${Date.now()}`,
        requestText,
        normalizedText: String(requestText ?? "").toLowerCase(),
        applicationType,
        industry: composition.industry,
        businessType: composition.name,
        users: ["Administrators", "Operational Users"],
        requiredFeatures: composition.requirements ?? [],
        integrations: [],
        deployment: "Docker + PostgreSQL",
        security: ["Authentication", "JWT", "RBAC", "Password hashing"],
        projectName: composition.name,
        projectId: composition.projectId,
        recommendedCapabilities: composition.capabilities ?? [],
        capabilitySummary: {
            selectedCount: composition.capabilities?.length ?? 0,
            source: "application-composition"
        },
        budget: null,
        mobileAccess: false
    };
}

function reserveProjectId(baseProjectId, workspaceRoot) {
    const baseId = String(baseProjectId ?? "").trim() || `project-${Date.now()}`;
    const candidates = [
        baseId,
        `${baseId}-company`,
        `${baseId}-company-2`,
        `${baseId}-${Date.now()}`
    ];

    for (const candidate of candidates) {
        const candidateRoot = path.resolve(workspaceRoot, candidate);
        if (!fs.existsSync(candidateRoot)) {
            return candidate;
        }
    }

    return `${baseId}-${Date.now()}`;
}

export function parseAnswersInput({ answersJson = "", answersFile = "" } = {}) {
    if (answersJson) {
        try {
            return JSON.parse(answersJson);
        }
        catch {
            const parsed = {};
            const entries = String(answersJson)
                .split(/;|\n/)
                .map(part => part.trim())
                .filter(Boolean);

            for (const entry of entries) {
                const separatorIndex = entry.indexOf("=");
                const colonIndex = entry.indexOf(":");
                const splitIndex = separatorIndex >= 0
                    ? separatorIndex
                    : colonIndex;

                if (splitIndex < 0) {
                    continue;
                }

                const key = entry.slice(0, splitIndex).trim();
                const value = entry.slice(splitIndex + 1).trim();
                if (key) {
                    parsed[key] = value;
                }
            }

            if (Object.keys(parsed).length > 0) {
                return parsed;
            }

            throw new Error("Unable to parse questionnaire answers.");
        }
    }

    if (answersFile) {
        const absolutePath = path.isAbsolute(answersFile)
            ? answersFile
            : path.join(process.cwd(), answersFile);
        return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
    }

    return null;
}

export async function runApplicationGeneration({
    type = null,
    requestText = "",
    answers = null,
    interactive = false,
    workspaceRoot = "workspace",
    languageContext = null
} = {}) {
    const availableTypes = new Set(listApplicationTypes());
    const requirementAnalyzer = new RequirementAnalyzer();
    const hasRequestText = Boolean(String(requestText ?? "").trim());
    const hasAnswers = Boolean(answers && typeof answers === "object");
    const hasInteractive = Boolean(interactive);
    let analysis;
    let composition;
    let applicationType;

    if (hasInteractive) {
        const questionnaireAnswers = await promptQuestionnaire(answers ?? {});
        const questionnaireResult = analyzeQuestionnaire(questionnaireAnswers, { type });
        analysis = questionnaireResult.requirementAnalysis;
        composition = questionnaireResult.applicationComposition;
        applicationType = analysis.applicationType;
    }
    else if (hasAnswers) {
        const questionnaireResult = analyzeQuestionnaire(answers, { type });
        analysis = questionnaireResult.requirementAnalysis;
        composition = questionnaireResult.applicationComposition;
        applicationType = analysis.applicationType;
    }
    else if (hasRequestText) {
        analysis = requirementAnalyzer.analyze({ requestText, applicationType: type });
        applicationType = analysis.applicationType;
        if (!availableTypes.has(applicationType)) {
            console.log(`Unknown application type "${applicationType}". Falling back to "crm".`);
            applicationType = "crm";
            analysis = requirementAnalyzer.analyze({ requestText, applicationType });
        }
        composition = requirementAnalyzer.buildApplicationComposition(analysis);
    }
    else {
        const normalizedType = String(type ?? "crm").toLowerCase();
        applicationType = availableTypes.has(normalizedType) ? normalizedType : "crm";
        if (applicationType !== normalizedType && type) {
            console.log(`Unknown application type "${type}". Falling back to "crm".`);
        }
        composition = getApplicationComposition(applicationType);
        analysis = buildAnalysisFromComposition(composition, "", applicationType);
    }

    const reservedProjectId = reserveProjectId(
        analysis.projectId ?? composition.projectId ?? `${applicationType}-${Date.now()}`,
        workspaceRoot
    );
    analysis.projectId = reservedProjectId;
    analysis.projectName = analysis.projectName ?? composition.name ?? composition.projectName;
    composition.projectId = reservedProjectId;
    composition.name = analysis.projectName ?? composition.name;

    const softwareFactory = createFactory({ workspaceRoot });
    const request = {
        requestType: "buildSoftware",
        applicationType,
        requestedCapabilities: composition.capabilities ?? analysis.recommendedCapabilities ?? [],
        capabilityComposition: composition.capabilities ?? analysis.recommendedCapabilities ?? [],
        requestAnalysis: analysis,
        languageContext,
        project: {
            projectId: reservedProjectId,
            name: analysis.projectName ?? composition.name ?? composition.projectName,
            description: analysis.requestText ?? composition.challenge ?? "",
            industry: analysis.industry ?? composition.industry,
            languageContext
        },
        challenge: analysis.requestText ?? composition.challenge ?? "",
        solution: analysis.businessType
            ? `Compose a ${analysis.businessType} using reusable capabilities.`
            : composition.solution,
        requirements: analysis.requiredFeatures ?? composition.requirements ?? []
    };

    const compositionName = composition.name ?? composition.projectName ?? applicationType.toUpperCase();

    console.log(`Generating ${compositionName} into ${workspaceRoot}/${reservedProjectId} ...`);

    const result = await softwareFactory.buildSoftware(request);

    const reportErrors = Array.isArray(result.report?.errors) ? result.report.errors : [];
    const buildCompleted = result.success && result.pipeline?.finalStatus === "completed" && reportErrors.length === 0;

    if (!buildCompleted) {
        console.error(`${compositionName} generation failed.`);
        console.error(result.error ?? result.message ?? "Unknown error");
        if (reportErrors.length) {
            console.error("Writer errors:");
            for (const error of reportErrors) {
                console.error(`- ${error.path ?? "unknown"}: ${error.error ?? error.message ?? "unknown error"}`);
            }
        }
        return {
            success: false,
            composition,
            result
        };
    }

    const projectRoot = path.join(workspaceRoot, result.project?.projectId ?? reservedProjectId);

    console.log(`${compositionName} generation completed.`);
    console.log(`Project ID: ${result.project?.projectId ?? composition.projectId}`);
    console.log(`Output: ${result.project?.outputDirectory ?? projectRoot}`);
    console.log(`Files written: ${result.report?.filesWritten ?? 0}`);
    console.log(`Final status: ${result.pipeline?.finalStatus ?? "unknown"}`);

    const validation = runValidation(projectRoot);

    const reportPaths = writeReportArtifacts(projectRoot, {
        applicationType,
        analysis,
        composition,
        result,
        validation
    });

    console.log(`Requirements analysis: ${reportPaths.requirementsPath}`);
    console.log(`Application composition: ${reportPaths.compositionPath}`);
    console.log(`Proposal: ${reportPaths.proposalPath}`);
    console.log(`Generation report: ${reportPaths.generationReportPath}`);
    console.log(`Migration report: ${reportPaths.migrationPath}`);
    console.log("Build validation completed.");

    return {
        success: true,
        composition,
        result,
        analysis,
        reportPaths,
        validation
    };
}

if (isMainModule()) {
    const parsed = parseCliArgs();
    const answers = parseAnswersInput(parsed);
    const outcome = await runApplicationGeneration({
        type: parsed.type,
        requestText: parsed.requestText,
        answers,
        interactive: parsed.interactive
    });
    if (!outcome.success) {
        process.exit(1);
    }
}
