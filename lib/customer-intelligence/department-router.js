function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class DepartmentRouter {
    route(input = {}) {
        const text = normalizeText(
            input.requestText ??
            input.text ??
            input.message ??
            input.analysis?.requestText ??
            ""
        );
        const classification = input.classification ?? {};

        if (classification.type === "BUG" || /\b(login|dashboard|broken|error|cannot access|can't access)\b/i.test(text)) {
            return {
                department: "Repair",
                rationale: "The request describes a product defect or blocked user access."
            };
        }

        if (/\b(invoice|billing|payment|refund)\b/i.test(text)) {
            return {
                department: "Billing",
                rationale: "The request is billing-related."
            };
        }

        if (/\bcomplaint|support|help|issue\b/i.test(text)) {
            return {
                department: "Customer Success",
                rationale: "The request needs customer support handling."
            };
        }

        if (/\bfeature|request|need|want\b/i.test(text)) {
            return {
                department: "Product",
                rationale: "The request is a feature or improvement request."
            };
        }

        return {
            department: "Operations",
            rationale: "No specialized routing rule matched."
        };
    }
}
