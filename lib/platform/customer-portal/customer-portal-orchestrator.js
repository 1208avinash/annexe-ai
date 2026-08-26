import CustomerIntakeService from "./intake/customer-intake-service.js";
import ProposalReviewService from "./proposal/proposal-review-service.js";
import ProjectApprovalService from "./approval/project-approval-service.js";
import ProjectTrackingService from "./tracking/project-tracking-service.js";
import CustomerReportService from "./reports/customer-report-service.js";
import CustomerPaymentService from "./billing/customer-payment-service.js";
import CustomerUpgradeService from "./upgrade/customer-upgrade-service.js";
import CustomerMemoryService from "./customer-memory-service.js";

export default class CustomerPortalOrchestrator {
    constructor({
        customerIntakeService = new CustomerIntakeService(),
        proposalReviewService = new ProposalReviewService(),
        projectApprovalService = new ProjectApprovalService(),
        projectTrackingService = new ProjectTrackingService(),
        customerReportService = new CustomerReportService(),
        customerPaymentService = new CustomerPaymentService(),
        customerUpgradeService = new CustomerUpgradeService(),
        customerMemoryService = new CustomerMemoryService()
    } = {}) {
        this.customerIntakeService = customerIntakeService;
        this.proposalReviewService = proposalReviewService;
        this.projectApprovalService = projectApprovalService;
        this.projectTrackingService = projectTrackingService;
        this.customerReportService = customerReportService;
        this.customerPaymentService = customerPaymentService;
        this.customerUpgradeService = customerUpgradeService;
        this.customerMemoryService = customerMemoryService;
    }

    processRequest(input = {}) {
        const intake = this.customerIntakeService.capture(input);
        const proposalReview = this.proposalReviewService.review(input);
        const approval = this.projectApprovalService.approve(input);
        const tracking = this.projectTrackingService.track(input);
        const paymentCenter = this.customerPaymentService.build(input);
        const upgradeCenter = this.customerUpgradeService.build(input);
        const memory = this.customerMemoryService.store(input);
        const report = this.customerReportService.createReport({
            customer: intake.profile,
            journey: intake.journey,
            projectOverview: tracking.projectOverview,
            companyActivity: tracking.companyActivity,
            deliverables: proposalReview.deliverables,
            paymentCenter,
            upgradeCenter,
            billingModel: paymentCenter.billingModel,
            platformReadiness: input.platformReadiness ?? 0,
            saasCapabilities: input.saasCapabilities ?? []
        });
        const persisted = this.customerReportService.persist(report, input.platformRoot ?? null, {
            intake,
            proposalReview,
            approval,
            tracking,
            paymentCenter,
            upgradeCenter,
            memory
        });

        return {
            intake,
            proposalReview,
            approval,
            tracking,
            paymentCenter,
            upgradeCenter,
            customerMemory: memory,
            report: persisted.report,
            reportPaths: persisted.paths,
            reportPath: persisted.paths?.customerOperatingSystem ?? null
        };
    }
}
