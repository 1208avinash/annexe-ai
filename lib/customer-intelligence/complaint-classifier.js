function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function scoreMatches(text, patterns) {
    return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

export default class ComplaintClassifier {
    classify(input = {}) {
        const text = normalizeText(
            input.requestText ??
            input.text ??
            input.message ??
            ""
        );
        const signals = input.signals ?? {};
        const reasons = [];

        const bugPatterns = [
            /\bbroken\b/,
            /\bdoes not work\b/,
            /\bwon't work\b/,
            /\bdoesn't work\b/,
            /\bcrash(es|ed)?\b/,
            /\bfail(s|ed|ure)?\b/,
            /\berror\b/,
            /\bbug\b/,
            /\bcannot access\b/,
            /\bcan't access\b/,
            /\blogin\b/
        ];

        const complaintPatterns = [
            /\bcomplaint\b/,
            /\bfrustrated\b/,
            /\bunhappy\b/,
            /\bissue\b/
        ];

        const requestPatterns = [
            /\bneed\b/,
            /\bwant\b/,
            /\bplease\b/,
            /\bhelp\b/
        ];

        const bugScore = scoreMatches(text, bugPatterns);
        const complaintScore = scoreMatches(text, complaintPatterns);
        const requestScore = scoreMatches(text, requestPatterns);
        const accessIssue = Boolean(signals.mentionsLogin || signals.mentionsDashboard || signals.mentionsCannotAccess);

        let type = "REQUEST";
        let subtype = "GENERAL";
        let confidence = 0.55;

        if (bugScore > 0 || accessIssue) {
            type = "BUG";
            subtype = accessIssue ? "ACCESS_FAILURE" : "APPLICATION_FAILURE";
            confidence = accessIssue ? 0.97 : 0.91;
            reasons.push("Symptoms indicate a product defect or access failure.");
        }
        else if (complaintScore > 0) {
            type = "COMPLAINT";
            subtype = "SERVICE_COMPLAINT";
            confidence = 0.78;
            reasons.push("Language expresses a complaint or service issue.");
        }
        else if (requestScore > 0) {
            type = "REQUEST";
            subtype = "SERVICE_REQUEST";
            confidence = 0.7;
            reasons.push("Language indicates a request for assistance.");
        }
        else {
            reasons.push("No strong complaint or defect keywords detected.");
        }

        if (accessIssue) {
            reasons.push("Login or dashboard access is explicitly affected.");
        }

        if (signals.mentionsUrgent) {
            reasons.push("Urgency language detected.");
        }

        return {
            type,
            subtype,
            confidence,
            reasons,
            isBug: type === "BUG",
            text
        };
    }
}
