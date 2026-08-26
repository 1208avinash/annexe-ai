import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class LanguageReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `LANG-${Date.now()}`,
            projectId: input.projectId ?? null,
            detectedLanguage: input.detectedLanguage ?? null,
            locale: input.locale ?? null,
            confidence: input.confidence ?? 0,
            supportedLanguages: input.supportedLanguages ?? [],
            supportedLocales: input.supportedLocales ?? [],
            languageContext: input.languageContext ?? null,
            localizationReadiness: {
                ui: Boolean(input.softwareLocalization),
                documentation: Boolean(input.documentationLocalization),
                cultural: Boolean(input.culturalAdaptation),
                memory: Boolean(input.languageMemory)
            },
            softwareTranslationReadiness: {
                uiLabels: Boolean(input.softwareLocalization?.localizedStrings),
                menus: Boolean(input.localization?.menuLabels),
                buttons: Boolean(input.softwareLocalization?.buttons),
                errorMessages: Boolean(input.softwareLocalization?.errorMessages)
            },
            documentationLocalizationReadiness: {
                userManual: Boolean(input.documentationLocalization?.userManual),
                apiDocumentation: Boolean(input.documentationLocalization?.apiDocumentation),
                proposals: Boolean(input.documentationLocalization?.proposals),
                reports: Boolean(input.documentationLocalization?.reports)
            },
            languageMemory: input.languageMemory ?? null,
            localization: input.localization ?? null,
            culturalAdaptation: input.culturalAdaptation ?? null,
            softwareLocalization: input.softwareLocalization ?? null,
            documentationLocalization: input.documentationLocalization ?? null,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "language", "language-intelligence-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
