import LanguageDetectorAgent from "./agents/language-detector-agent.js";
import TranslationAgent from "./agents/translation-agent.js";
import LocalizationAgent from "./agents/localization-agent.js";
import CulturalAdaptationAgent from "./agents/cultural-adaptation-agent.js";
import SoftwareLocalizationAgent from "./agents/software-localization-agent.js";
import DocumentationLanguageAgent from "./agents/documentation-language-agent.js";
import LanguageMemoryAgent from "./agents/language-memory-agent.js";
import LanguageReportGenerator from "./reports/language-report-generator.js";

const SUPPORTED_LANGUAGES = [
    "English",
    "French",
    "Spanish",
    "German",
    "Arabic",
    "Hindi",
    "Chinese",
    "Japanese",
    "Portuguese",
    "Italian"
];

const SUPPORTED_LOCALES = [
    "en-US",
    "fr-FR",
    "es-ES",
    "de-DE",
    "ar-SA",
    "hi-IN",
    "zh-CN",
    "ja-JP",
    "pt-BR",
    "it-IT"
];

export default class LanguageOrchestrator {
    constructor({
        languageDetectorAgent = new LanguageDetectorAgent(),
        translationAgent = new TranslationAgent(),
        localizationAgent = new LocalizationAgent(),
        culturalAdaptationAgent = new CulturalAdaptationAgent(),
        softwareLocalizationAgent = new SoftwareLocalizationAgent(),
        documentationLanguageAgent = new DocumentationLanguageAgent(),
        languageMemoryAgent = new LanguageMemoryAgent(),
        reportGenerator = new LanguageReportGenerator()
    } = {}) {
        this.languageDetectorAgent = languageDetectorAgent;
        this.translationAgent = translationAgent;
        this.localizationAgent = localizationAgent;
        this.culturalAdaptationAgent = culturalAdaptationAgent;
        this.softwareLocalizationAgent = softwareLocalizationAgent;
        this.documentationLanguageAgent = documentationLanguageAgent;
        this.languageMemoryAgent = languageMemoryAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const projectRoot = input.projectRoot ?? null;
        const languageMemory = this.languageMemoryAgent.load(projectRoot);
        const detectedLanguage = this.languageDetectorAgent.detect({
            ...input,
            languageMemory
        });
        const localizationRequired = input.localizationRequired ?? detectedLanguage.language !== "English";
        const culturalAdaptationRequired = input.culturalAdaptationRequired ?? localizationRequired;
        const translation = this.translationAgent.translate({
            text: input.requestText ?? "",
            sourceLanguage: input.analysis?.preferredLanguage ?? languageMemory?.preferredLanguage ?? "English",
            targetLanguage: detectedLanguage.language,
            locale: detectedLanguage.locale
        });
        const localization = this.localizationAgent.create({
            language: detectedLanguage.language,
            locale: detectedLanguage.locale
        });
        const culturalAdaptation = this.culturalAdaptationAgent.adapt({
            language: detectedLanguage.language,
            locale: detectedLanguage.locale,
            region: input.analysis?.region ?? input.analysis?.country ?? null
        });
        const softwareLocalization = this.softwareLocalizationAgent.localize({
            language: detectedLanguage.language,
            locale: detectedLanguage.locale,
            localization,
            translation,
            culturalAdaptation
        });
        const documentationLocalization = this.documentationLanguageAgent.generate({
            language: detectedLanguage.language,
            locale: detectedLanguage.locale,
            translation,
            reportTitle: "Localized Company Reports"
        });
        const memory = this.languageMemoryAgent.remember({
            language: detectedLanguage.language,
            locale: detectedLanguage.locale,
            region: culturalAdaptation.region,
            direction: detectedLanguage.direction,
            source: detectedLanguage.source ?? "detector",
            supportedLanguages: SUPPORTED_LANGUAGES,
            supportedLocales: SUPPORTED_LOCALES,
            localizationRequired,
            culturalAdaptationRequired,
            runtimeSwitching: true,
            userPreferencePersistence: true,
            rtlSupport: detectedLanguage.direction === "rtl"
        }, projectRoot);
        const languageContext = {
            language: detectedLanguage.language,
            locale: detectedLanguage.locale,
            confidence: detectedLanguage.confidence,
            source: detectedLanguage.source ?? "detector",
            customerLanguage: detectedLanguage.language,
            projectLanguage: memory.projectLanguage ?? detectedLanguage.language,
            supportedLanguages: SUPPORTED_LANGUAGES,
            supportedLocales: SUPPORTED_LOCALES,
            localizationRequired,
            culturalAdaptationRequired,
            translationRequired: localizationRequired,
            generatedApplicationDefaultLocale: memory.generatedApplicationDefaultLocale ?? detectedLanguage.locale,
            localization,
            culturalAdaptation,
            softwareLocalization,
            documentationLocalization,
            languageMemory: memory
        };
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            detectedLanguage: detectedLanguage.language,
            locale: detectedLanguage.locale,
            confidence: detectedLanguage.confidence,
            supportedLanguages: SUPPORTED_LANGUAGES,
            supportedLocales: SUPPORTED_LOCALES,
            localization,
            culturalAdaptation,
            softwareLocalization,
            documentationLocalization,
            languageMemory: memory,
            languageContext
        });
        const persisted = this.reportGenerator.persist(report, projectRoot);

        return {
            supportedLanguages: SUPPORTED_LANGUAGES,
            supportedLocales: SUPPORTED_LOCALES,
            detectedLanguage,
            translation,
            localization,
            culturalAdaptation,
            softwareLocalization,
            documentationLocalization,
            languageMemory: memory,
            languageContext,
            departmentResponseLanguage: {
                language: detectedLanguage.language,
                locale: detectedLanguage.locale,
                instruction: `Respond in ${detectedLanguage.language}.`
            },
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
