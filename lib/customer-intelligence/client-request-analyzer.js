function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();
}

function tokenize(text) {
    return normalizeText(text)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
}

function extractSignals(text) {
    return {
        mentionsLogin: /\blogin\b/i.test(text),
        mentionsDashboard: /\bdashboard\b/i.test(text),
        mentionsCustomer: /\bcustomer(s)?\b/i.test(text),
        mentionsBroken: /\bbroken\b/i.test(text),
        mentionsCannotAccess: /\bcannot access\b/i.test(text) || /\bcan't access\b/i.test(text),
        mentionsError: /\berror\b/i.test(text),
        mentionsUrgent: /\burgent\b/i.test(text) || /\bcritical\b/i.test(text) || /\basap\b/i.test(text)
    };
}

export default class ClientRequestAnalyzer {
    analyze(input = {}) {
        const requestText = normalizeText(
            input.requestText ??
            input.text ??
            input.message ??
            ""
        );

        return {
            requestText,
            tokens: tokenize(requestText),
            signals: extractSignals(requestText),
            customer: input.customer ?? null,
            project: input.project ?? null,
            analysis: input.analysis ?? null,
            receivedAt: new Date().toISOString()
        };
    }
}
