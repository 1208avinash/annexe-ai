import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import LanguageOrchestrator from "./lib/company/departments/language-intelligence/language-orchestrator.js";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-language-"));
const orchestrator = new LanguageOrchestrator();

const result = orchestrator.processRequest({
    requestText: "Je veux créer une application médicale",
    project: {
        projectId: "LANG-TEST",
        name: "Language Intelligence Test"
    },
    projectRoot: tempRoot
});

assert.equal(result.detectedLanguage.language, "French");
assert.equal(result.detectedLanguage.locale, "fr-FR");
assert.ok(result.detectedLanguage.confidence >= 0.95);
assert.equal(result.softwareLocalization.localizedStrings.login, "Connexion");
assert.equal(result.softwareLocalization.localizedStrings.dashboard, "Tableau de bord");
assert.equal(result.softwareLocalization.localizedStrings.settings, "Paramètres");
assert.equal(result.departmentResponseLanguage.language, "French");
assert.equal(result.languageMemory.preferredLanguage, "French");
assert.equal(result.report.supportedLanguages.includes("French"), true);
assert.equal(fs.existsSync(result.reportPath), true);
assert.equal(
    fs.existsSync(path.join(tempRoot, "reports", "company", "language", "language-memory.json")),
    true
);

console.log("Language intelligence test passed.");
