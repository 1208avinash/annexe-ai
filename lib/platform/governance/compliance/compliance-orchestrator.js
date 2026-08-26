import GdprAgent from "./gdpr/gdpr-agent.js";
import Soc2Agent from "./soc2/soc2-agent.js";
import Iso27001Agent from "./iso27001/iso27001-agent.js";
import HipaaAgent from "./hipaa/hipaa-agent.js";

export default class ComplianceOrchestrator {
    constructor({
        gdprAgent = new GdprAgent(),
        soc2Agent = new Soc2Agent(),
        iso27001Agent = new Iso27001Agent(),
        hipaaAgent = new HipaaAgent()
    } = {}) {
        this.gdprAgent = gdprAgent;
        this.soc2Agent = soc2Agent;
        this.iso27001Agent = iso27001Agent;
        this.hipaaAgent = hipaaAgent;
    }

    evaluate(input = {}) {
        const gdpr = this.gdprAgent.evaluate(input);
        const soc2 = this.soc2Agent.evaluate(input);
        const iso27001 = this.iso27001Agent.evaluate(input);
        const hipaa = this.hipaaAgent.evaluate(input);

        const scores = {
            gdpr: gdpr.score,
            soc2: soc2.score,
            iso27001: iso27001.score,
            hipaa: hipaa.score
        };

        const complianceScore = Math.round(
            Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.keys(scores).length
        );

        return {
            gdpr,
            soc2,
            iso27001,
            hipaa,
            scores,
            complianceScore,
            ready: true
        };
    }
}
