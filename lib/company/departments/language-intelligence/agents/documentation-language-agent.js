export default class DocumentationLanguageAgent {
    generate(input = {}) {
        const language = input.language ?? "English";
        const translation = input.translation ?? {};

        const userManualTitle = translation.glossary?.["User Manual"] ?? "User Manual";
        const apiDocumentationTitle = translation.glossary?.["API Documentation"] ?? "API Documentation";
        const proposalTitle = translation.glossary?.Proposal ?? "Proposal";

        return {
            language,
            locale: input.locale ?? "en-US",
            userManual: {
                title: userManualTitle,
                summary: `Operational guidance for using the platform in ${language}.`,
                sections: [
                    "Getting started",
                    "Authentication",
                    "Customer workflows",
                    "Reporting"
                ]
            },
            apiDocumentation: {
                title: apiDocumentationTitle,
                summary: `API reference delivered in ${language}.`,
                sections: [
                    "Health endpoint",
                    "Authentication endpoints",
                    "Customer APIs",
                    "Reporting APIs"
                ]
            },
            reports: {
                title: input.reportTitle ?? "Reports",
                language,
                sections: [
                    "Executive summary",
                    "Delivery report",
                    "Quality report"
                ]
            },
            proposals: {
                title: proposalTitle,
                summary: `Commercial proposal localized for ${language}.`,
                sections: [
                    "Business value",
                    "Implementation plan",
                    "Pricing",
                    "Payment milestones"
                ]
            },
            generatedAt: new Date().toISOString()
        };
    }
}
