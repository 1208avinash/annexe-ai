function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();
}

export default class DiscoveryAgent {
    discover(input = {}) {
        const text = normalizeText(input.requestText ?? input.analysis?.requestText ?? "");
        const painPoints = [];
        const currentSoftwareProblems = [];
        const businessObjectives = [];
        const expectedOutcomes = [];
        const requiredSolution = [];

        if (/real estate|crm|lead|customer/i.test(text)) {
            painPoints.push("Manual lead handling", "Slow customer follow-up", "Poor pipeline visibility");
            currentSoftwareProblems.push("Spreadsheet-based tracking", "Disconnected communication");
            businessObjectives.push("Increase lead conversion", "Improve response speed", "Centralize customer data");
            expectedOutcomes.push("Faster deal progression", "Higher visibility", "Better customer response");
            requiredSolution.push("AI CRM workflow", "Lead tracking", "Dashboard reporting");
        }
        else {
            painPoints.push("Operational inefficiency");
            currentSoftwareProblems.push("Legacy workflows");
            businessObjectives.push("Digitize processes");
            expectedOutcomes.push("Improved productivity");
            requiredSolution.push("Core business application");
        }

        return {
            customerPainPoints: Array.from(new Set(painPoints)),
            currentSoftwareProblems: Array.from(new Set(currentSoftwareProblems)),
            businessObjectives: Array.from(new Set(businessObjectives)),
            expectedOutcomes: Array.from(new Set(expectedOutcomes)),
            requiredSolution: Array.from(new Set(requiredSolution))
        };
    }
}
