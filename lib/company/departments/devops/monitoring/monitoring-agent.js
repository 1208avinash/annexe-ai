export default class MonitoringAgent {
    plan(input = {}) {
        const qaResults = input.qaResults ?? {};
        const healthy = Boolean(qaResults?.api?.passed) || Boolean(qaResults?.backend?.passed);

        return {
            monitoringStrategy: healthy ? "ENABLED" : "REVIEW",
            applicationHealth: "Tracked",
            apiPerformance: "Tracked",
            errors: "Tracked",
            uptime: "Tracked",
            resources: "Tracked",
            score: healthy ? 97 : 89
        };
    }
}
