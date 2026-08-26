function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function derivePriority({ classification, signals = {}, text = "" }) {
    const normalizedText = normalizeText(text);

    const criticalSignals = [
        /\bcannot access\b/i,
        /\bcan't access\b/i,
        /\blogin\b/i,
        /\bdashboard\b/i,
        /\bbroken\b/i,
        /\boutage\b/i,
        /\bdown\b/i,
        /\bsecurity\b/i,
        /\bpayments?\b/i
    ];

    const highSignals = [
        /\berror\b/i,
        /\bfail/i,
        /\bblocked\b/i,
        /\bunavailable\b/i,
        /\bproblem\b/i
    ];

    const hasCritical = criticalSignals.some(pattern => pattern.test(normalizedText));
    const hasHigh = highSignals.some(pattern => pattern.test(normalizedText));
    const accessIssue = Boolean(signals.mentionsCannotAccess || signals.mentionsLogin || signals.mentionsDashboard);

    if (classification?.type === "BUG" && (hasCritical || accessIssue)) {
        return {
            priority: "CRITICAL",
            score: 100,
            rationale: "Bug blocks login or dashboard access."
        };
    }

    if (classification?.type === "BUG" && hasHigh) {
        return {
            priority: "HIGH",
            score: 80,
            rationale: "Bug indicates an operational failure."
        };
    }

    if (hasCritical) {
        return {
            priority: "CRITICAL",
            score: 95,
            rationale: "Customer-facing access or service interruption."
        };
    }

    if (hasHigh || classification?.type === "COMPLAINT") {
        return {
            priority: "HIGH",
            score: 70,
            rationale: "Complaint requires prompt customer response."
        };
    }

    return {
        priority: "MEDIUM",
        score: 50,
        rationale: "No major urgency indicators detected."
    };
}

export default class PriorityEngine {
    assignPriority(input = {}) {
        return derivePriority(input);
    }
}
