const CULTURAL_GUIDANCE = {
    English: {
        region: "Global",
        dateFormat: "MM/DD/YYYY",
        currency: "USD",
        readingDirection: "ltr",
        tone: "clear, direct, and business-friendly"
    },
    French: {
        region: "France",
        dateFormat: "DD/MM/YYYY",
        currency: "EUR",
        readingDirection: "ltr",
        tone: "formal, concise, and professional"
    },
    Spanish: {
        region: "Spain and LATAM",
        dateFormat: "DD/MM/YYYY",
        currency: "EUR",
        readingDirection: "ltr",
        tone: "warm, collaborative, and professional"
    },
    German: {
        region: "Germany",
        dateFormat: "DD.MM.YYYY",
        currency: "EUR",
        readingDirection: "ltr",
        tone: "precise, structured, and professional"
    },
    Arabic: {
        region: "Middle East",
        dateFormat: "DD/MM/YYYY",
        currency: "SAR",
        readingDirection: "rtl",
        tone: "respectful, formal, and context-aware"
    },
    Hindi: {
        region: "India",
        dateFormat: "DD/MM/YYYY",
        currency: "INR",
        readingDirection: "ltr",
        tone: "clear, respectful, and approachable"
    },
    Chinese: {
        region: "China",
        dateFormat: "YYYY-MM-DD",
        currency: "CNY",
        readingDirection: "ltr",
        tone: "precise, efficient, and business-focused"
    },
    Japanese: {
        region: "Japan",
        dateFormat: "YYYY/MM/DD",
        currency: "JPY",
        readingDirection: "ltr",
        tone: "polite, concise, and detail-oriented"
    },
    Portuguese: {
        region: "Brazil and Portugal",
        dateFormat: "DD/MM/YYYY",
        currency: "BRL",
        readingDirection: "ltr",
        tone: "friendly, clear, and practical"
    },
    Italian: {
        region: "Italy",
        dateFormat: "DD/MM/YYYY",
        currency: "EUR",
        readingDirection: "ltr",
        tone: "professional, polished, and attentive"
    }
};

export default class CulturalAdaptationAgent {
    adapt(input = {}) {
        const language = input.language ?? "English";
        const pack = CULTURAL_GUIDANCE[language] ?? CULTURAL_GUIDANCE.English;

        return {
            language,
            locale: input.locale ?? "en-US",
            region: input.region ?? pack.region,
            dateFormat: pack.dateFormat,
            currency: pack.currency,
            readingDirection: pack.readingDirection,
            communicationTone: pack.tone,
            localizationNotes: [
                `Use ${pack.dateFormat} date formatting.`,
                `Prefer ${pack.currency} for financial presentation.`,
                pack.readingDirection === "rtl"
                    ? "Render layout right-to-left where applicable."
                    : "Preserve left-to-right layout."
            ],
            adaptedAt: new Date().toISOString()
        };
    }
}
