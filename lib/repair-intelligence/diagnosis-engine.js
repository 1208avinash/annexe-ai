function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class DiagnosisEngine {
    diagnose(input = {}) {
        const text = normalizeText(
            input.requestText ??
            input.issue ??
            input.analysis?.requestText ??
            ""
        );
        const customerClassification = input.customerClassification ?? null;
        const affectedComponents = new Set();

        if (customerClassification?.type === "BUG" || /\bbug\b|\bbroken\b|\bfail|\berror\b/.test(text)) {
            affectedComponents.add("authentication");
            affectedComponents.add("api");
        }

        if (/\blogin\b/.test(text)) {
            affectedComponents.add("login");
        }

        if (/\bdashboard\b/.test(text)) {
            affectedComponents.add("dashboard");
        }

        if (/\bauthentication\b/.test(text)) {
            affectedComponents.add("auth");
        }

        const severity = /\bstopped working\b|\bcannot access\b|\bcan't access\b|\bblocked\b/.test(text)
            ? "CRITICAL"
            : "HIGH";

        return {
            category: "BUG",
            severity,
            affectedComponents: Array.from(affectedComponents.size ? affectedComponents : ["backend", "frontend"]),
            summary: "Authentication-related access failure detected.",
            confidence: severity === "CRITICAL" ? 0.96 : 0.84
        };
    }
}
