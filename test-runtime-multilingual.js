import assert from "assert/strict";
import { randomUUID } from "crypto";
import fs from "fs";
import { spawnSync } from "child_process";
import path from "path";
import { pathToFileURL } from "url";

import { runCompanyOrchestration } from "./lib/company/company-orchestrator.js";

function runCommand(command, args, cwd) {
    const result = spawnSync(command, args, {
        cwd,
        encoding: "utf8",
        shell: true
    });

    if (result.status !== 0) {
        throw new Error(
            `${command} ${args.join(" ")} failed in ${cwd}\n` +
            `stdout:\n${result.stdout ?? ""}\n` +
            `stderr:\n${result.stderr ?? ""}`
        );
    }

    return result;
}

function runPythonTests(cwd) {
    const backendRoot = path.join(cwd, "backend");
    try {
        runCommand("python", ["-m", "pytest"], backendRoot);
    } catch (error) {
        const message = String(error?.message ?? "");
        if (!message.includes("No module named pytest")) {
            throw error;
        }

        runCommand(
            "python",
            ["-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py"],
            backendRoot
        );
    }
}

const outputRoot = path.join(process.cwd(), "workspace", "multilingual-tests", `runtime-${Date.now()}-${randomUUID().slice(0, 8)}`);
fs.mkdirSync(outputRoot, { recursive: true });

const company = await runCompanyOrchestration({
    requestText: "Je veux créer une application médicale pour une clinique",
    outputRoot
});

assert.ok(company.success);
assert.equal(company.languageDepartment.languageContext.language, "French");
assert.equal(company.languageDepartment.languageContext.locale, "fr-FR");
assert.equal(company.languageDepartment.languageContext.generatedApplicationDefaultLocale, "fr-FR");

const projectRoot = company.projectRoot;
const frontendRoot = path.join(projectRoot, "frontend");
const localizationResources = path.join(frontendRoot, "src", "localization", "resources.js");
const localizationIndex = path.join(frontendRoot, "src", "localization", "index.js");
const languageSelector = path.join(frontendRoot, "src", "components", "LanguageSelector.jsx");
const backendLocalization = path.join(projectRoot, "backend", "app", "localization.py");
const runtimeReport = path.join(projectRoot, "reports", "platform", "language", "runtime-multilingual-readiness-report.json");
const propagationReport = path.join(projectRoot, "reports", "platform", "language", "universal-language-propagation-report.json");

assert.ok(fs.existsSync(localizationResources));
assert.ok(fs.existsSync(localizationIndex));
assert.ok(fs.existsSync(languageSelector));
assert.ok(fs.existsSync(backendLocalization));
assert.ok(fs.existsSync(runtimeReport));
assert.ok(fs.existsSync(propagationReport));
assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "language", "language-memory.json")));
assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "language", "language-intelligence-report.json")));

const localizationModule = await import(pathToFileURL(localizationIndex).href);

assert.equal(typeof localizationModule.getCurrentLocale, "function");
assert.equal(typeof localizationModule.setLocale, "function");
assert.equal(typeof localizationModule.getSupportedLocales, "function");
assert.equal(typeof localizationModule.translate, "function");
assert.equal(typeof localizationModule.getStoredLocalePreference, "function");
assert.equal(typeof localizationModule.getLocaleDirection, "function");

assert.equal(localizationModule.getCurrentLocale(), "fr-FR");
assert.ok(localizationModule.getSupportedLocales().includes("fr-FR"));
assert.ok(localizationModule.getSupportedLocales().includes("en-US"));
assert.equal(localizationModule.LOCALIZATION.frontend.signIn, "Connexion");
assert.equal(localizationModule.LOCALIZATION.screens.dashboard, "Tableau de bord");
assert.equal(localizationModule.translate("frontend.signIn"), "Connexion");
assert.equal(localizationModule.translate("screens.login"), "Connexion");
assert.equal(localizationModule.translate("buttons.enter"), "Entrer dans ANNEXE AI");

const persistedFrench = localizationModule.setLocale("fr-FR");
assert.equal(persistedFrench, "fr-FR");
assert.equal(localizationModule.getStoredLocalePreference(), "fr-FR");
assert.equal(localizationModule.getCurrentLocale(), "fr-FR");

const switchedToEnglish = localizationModule.setLocale("en-US");
assert.equal(switchedToEnglish, "en-US");
assert.equal(localizationModule.getCurrentLocale(), "en-US");
assert.equal(localizationModule.getStoredLocalePreference(), "en-US");
assert.equal(localizationModule.translate("frontend.signIn"), "Sign in");
assert.equal(localizationModule.translate("screens.dashboard"), "Dashboard");

const switchedBackToFrench = localizationModule.setLocale("fr-FR");
assert.equal(switchedBackToFrench, "fr-FR");
assert.equal(localizationModule.getCurrentLocale(), "fr-FR");
assert.equal(localizationModule.translate("frontend.signIn"), "Connexion");

assert.equal(localizationModule.getLocaleDirection("ar-SA"), "rtl");
assert.equal(localizationModule.LOCALIZATION.rtlLocales.includes("ar-SA"), true);
assert.equal(localizationModule.LOCALIZATION.frontend.language, "Language");

const runtimeReportData = JSON.parse(fs.readFileSync(runtimeReport, "utf8"));
assert.equal(runtimeReportData.detectedLanguage, "French");
assert.equal(runtimeReportData.detectedLocale, "fr-FR");
assert.equal(runtimeReportData.generatedDefaultLocale, "fr-FR");
assert.ok(Array.isArray(runtimeReportData.supportedLocales));
assert.equal(runtimeReportData.runtimeSwitching, true);
assert.equal(runtimeReportData.preferencePersistence, true);
assert.equal(runtimeReportData.backendLocalization, true);
assert.equal(runtimeReportData.rtlReady, false);
assert.ok(runtimeReportData.fallbackBehavior.englishFallback);
assert.ok(runtimeReportData.score >= 75);

runCommand("python", ["-m", "compileall", "backend"], projectRoot);
runPythonTests(projectRoot);
runCommand("npm", ["install"], frontendRoot);
runCommand("npm", ["run", "build"], frontendRoot);
runCommand("npm", ["run", "smoke"], frontendRoot);

console.log("Runtime multilingual test passed.");
