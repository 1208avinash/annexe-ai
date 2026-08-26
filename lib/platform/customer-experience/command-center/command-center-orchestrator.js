import fs from "fs";
import path from "path";

import ProjectDashboardService from "../dashboard/project-dashboard-service.js";
import AiActivityService from "../activity/ai-activity-service.js";
import ProjectTimelineService from "../timeline/project-timeline-service.js";
import CustomerInsightService from "../insights/customer-insight-service.js";
import AiCeoInterface from "../ai-ceo/ai-ceo-interface.js";
import AdminDashboardOrchestrator from "../../admin-dashboard/admin-dashboard-orchestrator.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class CommandCenterOrchestrator {
  constructor({
    projectDashboardService = new ProjectDashboardService(),
    aiActivityService = new AiActivityService(),
    projectTimelineService = new ProjectTimelineService(),
    customerInsightService = new CustomerInsightService(),
    aiCeoInterface = new AiCeoInterface(),
    adminDashboardOrchestrator = new AdminDashboardOrchestrator()
  } = {}) {
    this.projectDashboardService = projectDashboardService;
    this.aiActivityService = aiActivityService;
    this.projectTimelineService = projectTimelineService;
    this.customerInsightService = customerInsightService;
    this.aiCeoInterface = aiCeoInterface;
    this.adminDashboardOrchestrator = adminDashboardOrchestrator;
  }

  build(input = {}) {
    const company = input.company ?? {};
    const productionPlatform = input.productionPlatform ?? {};
    const projectDashboard = this.projectDashboardService.build(input);
    const aiActivity = this.aiActivityService.build(input);
    const projectTimeline = this.projectTimelineService.build({
      timeline: projectDashboard.timeline,
      checkpoints: input.checkpoints
    });
    const customerInsight = this.customerInsightService.build(input);
    const adminDashboard = this.adminDashboardOrchestrator.processRequest({
      company,
      benchmarks: input.benchmarks
    });
    const aiAssistant = this.aiCeoInterface.respond(input.customerQuestion ?? "What is happening?", {
      projectDashboard,
      customerInsight,
      company,
      productionPlatform
    });
    const documents = {
      proposal: company.reportPaths?.proposal?.markdown ?? company.reportPaths?.proposal?.json ?? null,
      architectureDocument: company.reportPaths?.architecture?.markdown ?? null,
      engineeringReports: company.reportPaths?.engineering?.executionPlan ?? null,
      qaCertificate: company.reportPaths?.qa?.quality ?? null,
      securityCertificate: company.reportPaths?.security?.certificate ?? null,
      deploymentReport: company.reportPaths?.deployment?.markdown ?? null,
      evolutionReports: company.evolutionDepartment?.reportPath ?? null
    };
    const paymentCenter = company.customerPortal?.paymentCenter ?? {
      projectCost: company.estimation?.estimation?.estimatedCost ?? 0,
      advancePayment: Math.round((company.estimation?.estimation?.estimatedCost ?? 0) / 2),
      remainingPayment: Math.round((company.estimation?.estimation?.estimatedCost ?? 0) / 2),
      invoices: [],
      upgradePayments: "50% advance / 50% completion",
      subscriptions: []
    };
    const evolutionCenter = {
      recommendations: customerInsight.recommendations,
      actions: [
        "Request Upgrade",
        "Approve Evolution Plan"
      ]
    };

    return {
      customerCommandCenter: {
        aiCompanyStatus: aiActivity.stages,
        projectCommandCenter: projectDashboard,
        liveAiFactory: aiActivity,
        documentCenter: documents,
        paymentCenter,
        evolutionCenter,
        aiCeoAssistant: aiAssistant,
        realtime: {
          liveEvents: aiActivity.liveEvents
        }
      },
      adminCommandCenter: {
        sections: adminDashboard.views,
        revenueDashboard: adminDashboard.views?.ceo?.revenue ?? "$0"
      },
      aiActivity,
      projectDashboard,
      projectTimeline,
      customerInsight,
      aiCeoAssistant: aiAssistant,
      adminDashboard
    };
  }

  persist(report, platformRoot) {
    if (!platformRoot) {
      return null;
    }

    const reportPath = path.join(platformRoot, "reports", "platform", "command-center-readiness-report.json");
    writeJson(reportPath, report);
    return reportPath;
  }
}
