import ProductStrategyAgent from "./strategy/product-strategy-agent.js";
import RoadmapAgent from "./roadmap/roadmap-agent.js";
import FeaturePrioritizer from "./features/feature-prioritizer.js";
import UserStoryGenerator from "./stories/user-story-generator.js";
import AcceptanceCriteriaGenerator from "./planning/acceptance-criteria-generator.js";
import ProductReportGenerator from "./reports/product-report-generator.js";

export default class ProductOrchestrator {
    constructor({
        strategyAgent = new ProductStrategyAgent(),
        roadmapAgent = new RoadmapAgent(),
        featurePrioritizer = new FeaturePrioritizer(),
        userStoryGenerator = new UserStoryGenerator(),
        acceptanceCriteriaGenerator = new AcceptanceCriteriaGenerator(),
        reportGenerator = new ProductReportGenerator()
    } = {}) {
        this.strategyAgent = strategyAgent;
        this.roadmapAgent = roadmapAgent;
        this.featurePrioritizer = featurePrioritizer;
        this.userStoryGenerator = userStoryGenerator;
        this.acceptanceCriteriaGenerator = acceptanceCriteriaGenerator;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const productStrategy = this.strategyAgent.generate(input);
        const roadmap = this.roadmapAgent.create({
            features: input.features ?? input.salesDepartment?.proposal?.solutionSummary ?? []
        });
        const priorities = this.featurePrioritizer.prioritize({
            features: input.features ?? [
                "Authentication",
                "Customer Management",
                "Dashboard",
                "Automation",
                "Notifications",
                "Analytics",
                "AI Lead Scoring"
            ]
        });
        const userStories = this.userStoryGenerator.generate({
            priorities,
            targetUser: input.targetUsers ?? productStrategy.targetUsers
        });
        const acceptanceCriteria = this.acceptanceCriteriaGenerator.generate({
            stories: userStories
        });
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            strategy: productStrategy,
            roadmap,
            priorities,
            userStories,
            acceptanceCriteria
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            productStrategy,
            roadmap,
            priorities,
            userStories,
            acceptanceCriteria,
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
