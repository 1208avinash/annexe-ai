const LANGUAGE_SIGNATURES = [
    {
        language: "French",
        locale: "fr-FR",
        direction: "ltr",
        patterns: [
            /je veux/i,
            /cr[eé]er/i,
            /application/i,
            /tableau de bord/i,
            /connexion/i,
            /param[eè]tres?/i,
            /clients?/i,
            /m[eé]dical/i,
            /rapports?/i
        ]
    },
    {
        language: "Spanish",
        locale: "es-ES",
        direction: "ltr",
        patterns: [
            /quiero/i,
            /crear/i,
            /aplicaci[oó]n/i,
            /panel/i,
            /configuraci[oó]n/i,
            /clientes?/i,
            /informes?/i
        ]
    },
    {
        language: "German",
        locale: "de-DE",
        direction: "ltr",
        patterns: [
            /ich m[oö]chte/i,
            /erstellen/i,
            /anwendung/i,
            /kunden?/i,
            /einstellungen/i,
            /berichte/i
        ]
    },
    {
        language: "Arabic",
        locale: "ar-SA",
        direction: "rtl",
        patterns: [/[\u0600-\u06FF]/]
    },
    {
        language: "Hindi",
        locale: "hi-IN",
        direction: "ltr",
        patterns: [/[\u0900-\u097F]/]
    },
    {
        language: "Chinese",
        locale: "zh-CN",
        direction: "ltr",
        patterns: [/[\u4E00-\u9FFF]/]
    },
    {
        language: "Japanese",
        locale: "ja-JP",
        direction: "ltr",
        patterns: [/[\u3040-\u30FF\u4E00-\u9FFF]/]
    },
    {
        language: "Portuguese",
        locale: "pt-BR",
        direction: "ltr",
        patterns: [
            /quero/i,
            /criar/i,
            /aplicativo/i,
            /painel/i,
            /configura[cç][aã]o/i,
            /clientes?/i
        ]
    },
    {
        language: "Italian",
        locale: "it-IT",
        direction: "ltr",
        patterns: [
            /voglio/i,
            /creare/i,
            /applicazione/i,
            /cruscotto/i,
            /impostazioni/i,
            /clienti/i
        ]
    }
];

function scoreLanguage(text, signature) {
    let score = 0;

    for (const pattern of signature.patterns) {
        if (pattern.test(text)) {
            score += 1;
        }
    }

    return score;
}

export default class LanguageDetectorAgent {
    detect(input = {}) {
        const requestText = String(input.requestText ?? "").trim();
        const memoryLanguage = input.languageMemory?.preferredLanguage ?? null;
        const memoryLocale = input.languageMemory?.preferredLocale ?? null;

        if (!requestText && memoryLanguage) {
            return {
                language: memoryLanguage,
                locale: memoryLocale ?? "en-US",
                confidence: 0.91,
                direction: input.languageMemory?.direction ?? "ltr",
                matchedSignals: ["language-memory"],
                source: "memory",
                detectedAt: new Date().toISOString()
            };
        }

        let bestMatch = {
            language: "English",
            locale: "en-US",
            direction: "ltr",
            confidence: 0.4,
            matchedSignals: ["default"]
        };

        for (const signature of LANGUAGE_SIGNATURES) {
            const score = scoreLanguage(requestText, signature);

            if (score > 0) {
                const confidence = Math.min(0.98, 0.58 + (score * 0.11));

                if (confidence >= bestMatch.confidence) {
                    bestMatch = {
                        language: signature.language,
                        locale: signature.locale,
                        direction: signature.direction,
                        confidence,
                        matchedSignals: signature.patterns
                            .filter(pattern => pattern.test(requestText))
                            .map(pattern => String(pattern))
                    };
                }
            }
        }

        if (bestMatch.language === "English" && memoryLanguage && bestMatch.confidence < 0.8) {
            return {
                language: memoryLanguage,
                locale: memoryLocale ?? "en-US",
                confidence: 0.86,
                direction: input.languageMemory?.direction ?? "ltr",
                matchedSignals: ["memory-fallback"],
                source: "memory",
                detectedAt: new Date().toISOString()
            };
        }

        return {
            ...bestMatch,
            source: "detector",
            detectedAt: new Date().toISOString()
        };
    }
}
