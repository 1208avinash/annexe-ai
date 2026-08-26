import MarketAnalyzer from "./market-intelligence/market-analyzer.js";
import StrategyAgent from "./strategy/strategy-agent.js";
import FinancialForecastAgent from "./finance/financial-forecast-agent.js";
import RiskAnalysisAgent from "./risk/risk-analysis-agent.js";
import CEOReportGenerator from "./reports/ceo-report-generator.js";

export default class CEOOrchestrator {
    constructor({
        marketAnalyzer = new MarketAnalyzer(),
        strategyAgent = new StrategyAgent(),
        financialForecastAgent = new FinancialForecastAgent(),
        riskAnalysisAgent = new RiskAnalysisAgent(),
        reportGenerator = new CEOReportGenerator()
    } = {}) {
        this.marketAnalyzer = marketAnalyzer;
        this.strategyAgent = strategyAgent;
        this.financialForecastAgent = financialForecastAgent;
        this.riskAnalysisAgent = riskAnalysisAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const marketAnalysis = this.marketAnalyzer.analyze(input);
        const strategy = this.strategyAgent.generate({
            market: marketAnalysis,
            industry: input.industry ?? input.analysis?.industry ?? "Business Software"
        });
        const financialForecast = this.financialForecastAgent.forecast({
            market: marketAnalysis,
            features: input.features ?? input.analysis?.requiredFeatures ?? []
        });
        const riskAnalysis = this.riskAnalysisAgent.analyze({
            requestText: input.requestText ?? "",
            industry: input.industry ?? input.analysis?.industry ?? ""
        });
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            projectName: input.project?.name ?? null,
            industry: input.industry ?? input.analysis?.industry ?? null,
            marketAnalysis,
            strategy,
            financialForecast,
            riskAnalysis
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            marketAnalysis,
            strategy,
            financialForecast,
            riskAnalysis,
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
