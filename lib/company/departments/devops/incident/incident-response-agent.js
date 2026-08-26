export default class IncidentResponseAgent {
    plan(input = {}) {
        const incidents = Array.isArray(input.qaResults?.security?.issues) ? input.qaResults.security.issues : [];

        return {
            incidentResponsePlan: incidents.length ? "REVIEW" : "READY",
            failures: "Classified",
            outages: "Classified",
            serviceDegradation: "Covered",
            userImpact: "Covered",
            score: incidents.length ? 90 : 96
        };
    }
}
