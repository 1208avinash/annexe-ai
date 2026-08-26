import TechnologyEvolutionAgent from "./technology/technology-evolution-agent.js";
import MarketEvolutionAgent from "./market/market-evolution-agent.js";
import ProductEvolutionAgent from "./product/product-evolution-agent.js";
import PerformanceEvolutionAgent from "./performance/performance-evolution-agent.js";
import SecurityEvolutionAgent from "./security/security-evolution-agent.js";
import AIImprovementAgent from "./ai/ai-improvement-agent.js";
import EvolutionRecommendationAgent from "./recommendation/evolution-recommendation-agent.js";
import EvolutionRoadmapAgent from "./planning/evolution-roadmap-agent.js";
import EvolutionReportGenerator from "./reports/evolution-report-generator.js";

export default class EvolutionOrchestrator {
    constructor({
        technologyEvolutionAgent = new TechnologyEvolutionAgent(),
        marketEvolutionAgent = new MarketEvolutionAgent(),
        productEvolutionAgent = new ProductEvolutionAgent(),
        performanceEvolutionAgent = new PerformanceEvolutionAgent(),
        securityEvolutionAgent = new SecurityEvolutionAgent(),
        aiImprovementAgent = new AIImprovementAgent(),
        evolutionRecommendationAgent = new EvolutionRecommendationAgent(),
        evolutionRoadmapAgent = new EvolutionRoadmapAgent(),
        reportGenerator = new EvolutionReportGenerator()
    } = {}) {
        this.technologyEvolutionAgent = technologyEvolutionAgent;
        this.marketEvolutionAgent = marketEvolutionAgent;
        this.productEvolutionAgent = productEvolutionAgent;
        this.performanceEvolutionAgent = performanceEvolutionAgent;
        this.securityEvolutionAgent = securityEvolutionAgent;
        this.aiImprovementAgent = aiImprovementAgent;
        this.evolutionRecommendationAgent = evolutionRecommendationAgent;
        this.evolutionRoadmapAgent = evolutionRoadmapAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const technology = this.technologyEvolutionAgent.analyze(input);
        const market = this.marketEvolutionAgent.analyze(input);
        const product = this.productEvolutionAgent.analyze(input);
        const performance = this.performanceEvolutionAgent.analyze(input);
        const security = this.securityEvolutionAgent.analyze(input);
        const ai = this.aiImprovementAgent.analyze(input);
        const recommendation = this.evolutionRecommendationAgent.recommend({
            technology,
            market,
            product,
            performance,
            security,
            ai
        });
        const roadmap = this.evolutionRoadmapAgent.plan({
            ...input,
            recommendation
        });
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            projectName: input.project?.name ?? null,
            technology,
            market,
            product,
            performance,
            security,
            ai,
            recommendation,
            roadmap
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null, {
            technology,
            market,
            product,
            performance,
            security,
            ai,
            recommendation,
            roadmap
        });

        return {
            technology,
            market,
            product,
            performance,
            security,
            ai,
            recommendation,
            roadmap,
            report: persisted.report,
            reportPaths: persisted.paths,
            reportPath: persisted.paths?.certification ?? null
        };
    }
}
