function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}

function inferImpactedFiles(diagnosis = {}) {
    const components = diagnosis.affectedComponents ?? [];
    const files = [
        "backend/app/main.py",
        "backend/app/dependencies.py",
        "backend/app/routers/auth.py",
        "backend/app/schemas/auth.py",
        "frontend/src/services/api.js",
        "frontend/src/pages/Login.jsx"
    ];

    if (components.includes("dashboard")) {
        files.push("frontend/src/pages/Dashboard.jsx");
    }

    if (components.includes("authentication") || components.includes("auth")) {
        files.push("backend/app/services/auth_service.py");
        files.push("backend/app/repositories/user_repository.py");
    }

    return unique(files);
}

export default class RootCauseAnalyzer {
    analyze(input = {}) {
        const diagnosis = input.diagnosis ?? {};
        const text = String(input.requestText ?? input.issue ?? "").toLowerCase();

        const cause = text.includes("authentication update")
            ? "Recent authentication changes likely altered token validation or login routing."
            : "A regression in the access path is preventing successful login.";

        return {
            cause,
            impactedFiles: inferImpactedFiles(diagnosis),
            recommendedFix: diagnosis.severity === "CRITICAL"
                ? "Restore the authentication flow, verify login token issuance, and re-run access checks."
                : "Review the affected access path and patch the broken authentication step.",
            evidence: [
                diagnosis.summary ?? "",
                `Category: ${diagnosis.category ?? "UNKNOWN"}`,
                `Severity: ${diagnosis.severity ?? "UNKNOWN"}`
            ].filter(Boolean)
        };
    }
}
