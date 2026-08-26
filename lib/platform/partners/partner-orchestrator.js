import fs from "fs";
import path from "path";

import PartnerManagementService from "./partners/partner-management-service.js";
import PartnerOnboardingService from "./onboarding/partner-onboarding-service.js";
import PartnerCustomerService from "./customers/partner-customer-service.js";
import PartnerSalesService from "./sales/partner-sales-service.js";
import CommissionService from "./commission/commission-service.js";
import PartnerAnalyticsService from "./analytics/partner-analytics-service.js";
import PartnerReportGenerator from "./reports/partner-report-generator.js";
import WhiteLabelManager from "../white-label/white-label-manager.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class PartnerOrchestrator {
  constructor({
    partnerManagementService = new PartnerManagementService(),
    partnerOnboardingService = new PartnerOnboardingService(),
    partnerCustomerService = new PartnerCustomerService(),
    partnerSalesService = new PartnerSalesService(),
    commissionService = new CommissionService(),
    partnerAnalyticsService = new PartnerAnalyticsService(),
    partnerReportGenerator = new PartnerReportGenerator(),
    whiteLabelManager = new WhiteLabelManager()
  } = {}) {
    this.partnerManagementService = partnerManagementService;
    this.partnerOnboardingService = partnerOnboardingService;
    this.partnerCustomerService = partnerCustomerService;
    this.partnerSalesService = partnerSalesService;
    this.commissionService = commissionService;
    this.partnerAnalyticsService = partnerAnalyticsService;
    this.partnerReportGenerator = partnerReportGenerator;
    this.whiteLabelManager = whiteLabelManager;
  }

  build(input = {}) {
    const partnerManagement = this.partnerManagementService.build(input);
    const primaryPartner = partnerManagement.partners[0] ?? null;
    const onboarding = this.partnerOnboardingService.build({ partner: primaryPartner });
    const whiteLabel = this.whiteLabelManager.build({
      companyName: primaryPartner?.companyName ?? input.companyName ?? "ANNEXE AI",
      branding: primaryPartner?.branding ?? input.branding ?? {}
    });
    const customers = this.partnerCustomerService.build({
      partner: primaryPartner,
      products: input.products ?? []
    });
    const sales = this.partnerSalesService.build({
      partner: primaryPartner,
      products: input.products ?? []
    });
    const commission = this.commissionService.build({
      sales: {
        productRevenue: sales.revenue,
        upgradeRevenue: Math.round(sales.revenue * 0.25),
        subscriptionRevenue: Math.round(sales.revenue * 0.15)
      }
    });
    const analytics = this.partnerAnalyticsService.build({
      customers: customers.customers,
      sales,
      commission
    });
    const report = this.partnerReportGenerator.createReport({
      partners: partnerManagement.partners,
      customers: customers.customers,
      sales,
      commission,
      analytics,
      whiteLabel
    });

    return {
      partnerManagement,
      onboarding,
      customers,
      sales,
      commission,
      analytics,
      whiteLabel,
      report
    };
  }

  persist(report, platformRoot) {
    if (!platformRoot) {
      return null;
    }

    ensureDir(path.join(platformRoot, "reports", "platform", "partners"));
    return this.partnerReportGenerator.persist(report, platformRoot);
  }
}
