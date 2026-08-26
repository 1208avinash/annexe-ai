import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class LanguageMemoryAgent {
    getMemoryPath(projectRoot) {
        return projectRoot ? path.join(projectRoot, "reports", "company", "language", "language-memory.json") : null;
    }

    load(projectRoot) {
        const memoryPath = this.getMemoryPath(projectRoot);
        if (!memoryPath || !fs.existsSync(memoryPath)) {
            return null;
        }

        return readJson(memoryPath);
    }

    remember(input = {}, projectRoot) {
        const memoryPath = this.getMemoryPath(projectRoot);
        const previous = this.load(projectRoot) ?? {};
        const supportedLanguages = Array.isArray(input.supportedLanguages) && input.supportedLanguages.length
            ? input.supportedLanguages
            : previous.supportedLanguages ?? [];
        const localizationRequired = input.localizationRequired ?? previous.localizationRequired ?? (input.language ? input.language !== "English" : false);
        const culturalAdaptationRequired = input.culturalAdaptationRequired ?? previous.culturalAdaptationRequired ?? localizationRequired;
        const supportedLocales = Array.isArray(input.supportedLocales) && input.supportedLocales.length
            ? input.supportedLocales
            : previous.supportedLocales ?? [];

        const memory = {
            customerLanguage: input.language ?? previous.customerLanguage ?? "English",
            preferredLanguage: input.language ?? previous.preferredLanguage ?? "English",
            preferredLocale: input.locale ?? previous.preferredLocale ?? "en-US",
            projectLanguage: input.language ?? previous.projectLanguage ?? "English",
            projectLocale: input.locale ?? previous.projectLocale ?? "en-US",
            generatedApplicationDefaultLocale: input.locale ?? previous.generatedApplicationDefaultLocale ?? "en-US",
            supportedLanguages,
            supportedLocales,
            localizationRequired,
            culturalAdaptationRequired,
            region: input.region ?? previous.region ?? "Global",
            conversationLanguage: input.language ?? previous.conversationLanguage ?? "English",
            direction: input.direction ?? previous.direction ?? "ltr",
            runtimeSwitching: input.runtimeSwitching ?? previous.runtimeSwitching ?? false,
            userPreferencePersistence: input.userPreferencePersistence ?? previous.userPreferencePersistence ?? false,
            rtlSupport: input.rtlSupport ?? previous.rtlSupport ?? false,
            source: input.source ?? previous.source ?? "customer-input",
            updatedAt: new Date().toISOString()
        };

        if (memoryPath) {
            writeJson(memoryPath, memory);
        }

        return memory;
    }
}
