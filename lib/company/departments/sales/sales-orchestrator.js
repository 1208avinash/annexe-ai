import LeadAnalyzer from "./lead-intelligence/lead-analyzer.js";
import DiscoveryAgent from "./customer-discovery/discovery-agent.js";
import SalesProposalAgent from "./proposal/sales-proposal-agent.js";
import NegotiationAgent from "./negotiation/negotiation-agent.js";
import SalesForecastAgent from "./forecasting/sales-forecast-agent.js";
import SalesReportGenerator from "./reports/sales-report-generator.js";

export default class SalesOrchestrator {
    constructor({
        leadAnalyzer = new LeadAnalyzer(),
        discoveryAgent = new DiscoveryAgent(),
        proposalAgent = new SalesProposalAgent(),
        negotiationAgent = new NegotiationAgent(),
        forecastAgent = new SalesForecastAgent(),
        reportGenerator = new SalesReportGenerator()
    } = {}) {
        this.leadAnalyzer = leadAnalyzer;
        this.discoveryAgent = discoveryAgent;
        this.proposalAgent = proposalAgent;
        this.negotiationAgent = negotiationAgent;
        this.forecastAgent = forecastAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const leadAnalysis = this.leadAnalyzer.analyze(input);
        const discovery = this.discoveryAgent.discover(input);
        const proposal = this.proposalAgent.generate({
            ...input,
            leadAnalysis,
            discovery,
            timeline: input.timeline ?? "6-10 weeks",
            estimatedCost: input.estimatedCost ?? 250000
        });
        const negotiation = this.negotiationAgent.analyze(input);
        const forecast = this.forecastAgent.forecast({
            leadScore: leadAnalysis.leadScore,
            pricingRecommendation: input.estimatedCost ?? 250000,
            timeline: proposal.timeline
        });
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            leadAnalysis,
            discovery,
            proposal,
            negotiation,
            forecast
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            leadAnalysis,
            discovery,
            proposal,
            negotiation,
            forecast,
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
