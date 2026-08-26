import assert from "assert/strict";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

import { runCompanyOrchestration } from "./lib/company/company-orchestrator.js";
import LanguageOrchestrator from "./lib/company/departments/language-intelligence/language-orchestrator.js";

function createProjectRoot(baseRoot, name) {
    const projectRoot = path.join(baseRoot, name);
    fs.mkdirSync(projectRoot, { recursive: true });
    return projectRoot;
}

function assertDetection(orchestrator, inputText, expectedLanguage, expectedLocale, projectId, projectRoot) {
    const result = orchestrator.processRequest({
        requestText: inputText,
        project: {
            projectId,
            name: projectId
        },
        projectRoot
    });

    assert.equal(result.detectedLanguage.language, expectedLanguage);
    assert.equal(result.detectedLanguage.locale, expectedLocale);
    assert.equal(result.languageContext.language, expectedLanguage);
    assert.equal(result.languageContext.locale, expectedLocale);
    assert.ok(result.languageContext.localizationRequired !== undefined);
    assert.ok(Array.isArray(result.supportedLocales));
    assert.ok(result.supportedLocales.includes(expectedLocale));
    assert.ok(fs.existsSync(result.reportPath));
    assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "language", "language-memory.json")));

    return result;
}

const stableTestsRoot = path.join(process.cwd(), "workspace", "multilingual-tests");
fs.mkdirSync(stableTestsRoot, { recursive: true });
const stableOutputRoot = path.join(stableTestsRoot, `french-${Date.now()}-${randomUUID().slice(0, 8)}`);
const detector = new LanguageOrchestrator();

assertDetection(detector, "Create a CRM for a logistics company", "English", "en-US", "en-check", createProjectRoot(stableOutputRoot, "en-check"));
assertDetection(detector, "Je veux créer une application médicale", "French", "fr-FR", "fr-check", createProjectRoot(stableOutputRoot, "fr-check"));
assertDetection(
    detector,
    "\u092E\u0948\u0902 \u090F\u0915 \u092E\u0947\u0921\u093F\u0915\u0932 \u090F\u092A \u092C\u0928\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u093E \u0939\u0942\u0902",
    "Hindi",
    "hi-IN",
    "hi-check",
    createProjectRoot(stableOutputRoot, "hi-check")
);
assertDetection(detector, "Ich möchte eine Anwendung für Kunden und Berichte erstellen", "German", "de-DE", "de-check", createProjectRoot(stableOutputRoot, "de-check"));

const mixedResult = detector.processRequest({
    requestText: "Je veux créer une application de gestion pour une business in India.",
    project: {
        projectId: "mixed-check",
        name: "mixed-check"
    },
    projectRoot: createProjectRoot(stableOutputRoot, "mixed-check")
});

assert.equal(mixedResult.detectedLanguage.language, "French");
assert.equal(mixedResult.detectedLanguage.locale, "fr-FR");
assert.equal(mixedResult.languageContext.projectLanguage, "French");

const company = await runCompanyOrchestration({
    requestText: "Je veux créer une application médicale pour une clinique",
    outputRoot: stableOutputRoot
});

assert.ok(company.success);
assert.ok(company.languageDepartment);
assert.equal(company.languageDepartment.languageContext.language, "French");
assert.equal(company.languageDepartment.languageContext.locale, "fr-FR");
assert.equal(company.languageDepartment.languageContext.generatedApplicationDefaultLocale, "fr-FR");

const projectRoot = company.projectRoot;
const frontendLocalizationResources = path.join(projectRoot, "frontend", "src", "localization", "resources.js");
const frontendLocalizationIndex = path.join(projectRoot, "frontend", "src", "localization", "index.js");
const backendLocalization = path.join(projectRoot, "backend", "app", "localization.py");
const universalReportPath = path.join(projectRoot, "reports", "platform", "language", "universal-language-propagation-report.json");

assert.ok(fs.existsSync(frontendLocalizationResources));
assert.ok(fs.existsSync(frontendLocalizationIndex));
assert.ok(fs.existsSync(backendLocalization));
assert.ok(fs.existsSync(universalReportPath));
assert.ok(fs.existsSync(company.reportPaths.languagePropagation));
assert.ok(fs.existsSync(company.reportPaths.languageCertification));

const resourcesContent = fs.readFileSync(frontendLocalizationResources, "utf8");
const backendLocalizationContent = fs.readFileSync(backendLocalization, "utf8");
const appContent = fs.readFileSync(path.join(projectRoot, "frontend", "src", "App.jsx"), "utf8");
const loginContent = fs.readFileSync(path.join(projectRoot, "frontend", "src", "pages", "Login.jsx"), "utf8");
const rootReadme = fs.readFileSync(path.join(projectRoot, "README.md"), "utf8");
const propagationReport = JSON.parse(fs.readFileSync(universalReportPath, "utf8"));

assert.match(resourcesContent, /"login": "Connexion"/);
assert.match(resourcesContent, /"dashboard": "Tableau de bord"/);
assert.match(backendLocalizationContent, /DEFAULT_LOCALE/);
assert.match(backendLocalizationContent, /fr-FR/);
assert.match(appContent, /Login/);
assert.match(appContent, /Dashboard/);
assert.match(appContent, /Customers/);
assert.match(loginContent, /LOCALIZATION\.screens\.login/);
assert.match(rootReadme, /Supported locales:/);
assert.match(rootReadme, /French \(fr-FR\)/);

assert.equal(propagationReport.detectedLanguage.language, "French");
assert.equal(propagationReport.locale, "fr-FR");
assert.equal(propagationReport.propagationStatus.propagatedToGeneration, true);
assert.equal(propagationReport.propagationStatus.frontendLocalizationReady, true);
assert.equal(propagationReport.propagationStatus.backendLocalizationReady, true);
assert.ok(propagationReport.departmentsReceivingContext.length >= 10);
assert.ok(propagationReport.persistenceStatus.languageMemory);
assert.ok(propagationReport.persistenceStatus.languageReport);
assert.ok(propagationReport.readinessScore >= 70);

console.log("Universal language propagation test passed.");
