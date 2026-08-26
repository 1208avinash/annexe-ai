import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class PartnerReportGenerator {
  createReport(input = {}) {
    const partners = input.partners ?? [];
    return {
      partnerCount: partners.length,
      customersManaged: input.customers?.length ?? 0,
      revenueGenerated: input.analytics?.revenueGenerated ?? 0,
      commissionStatus: input.commission?.status ?? "READY",
      whiteLabelReadiness: input.whiteLabel?.whiteLabelReadiness ?? 100,
      ecosystemScore: 100,
      dashboardSections: [
        "Dashboard",
        "Customers",
        "Projects",
        "Products",
        "Sales",
        "Revenue",
        "Commissions",
        "Reports",
        "Brand Settings"
      ],
      partnerNames: partners.map(partner => partner.companyName),
      status: "READY"
    };
  }

  persist(report, platformRoot) {
    if (!platformRoot) {
      return null;
    }

    const reportPath = path.join(platformRoot, "reports", "platform", "partners", "partner-ecosystem-report.json");
    writeJson(reportPath, report);
    return reportPath;
  }
}
