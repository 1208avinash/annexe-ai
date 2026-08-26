import fs from "fs";
import path from "path";

function defaultEmployees() {
    return {
        employees: {
            sales: {
                emailsHandled: 0,
                actionsCreated: 0
            },
            support: {
                emailsHandled: 0,
                actionsCreated: 0
            },
            security: {
                emailsHandled: 0,
                actionsCreated: 0
            },
            billing: {
                emailsHandled: 0,
                actionsCreated: 0
            },
            ceo: {
                emailsHandled: 0,
                actionsCreated: 0
            }
        }
    };
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}

function normalizeKey(employeeName = "") {
    const value = String(employeeName).toLowerCase();
    if (value.includes("sales")) {
        return "sales";
    }
    if (value.includes("support")) {
        return "support";
    }
    if (value.includes("security")) {
        return "security";
    }
    if (value.includes("billing")) {
        return "billing";
    }
    return "ceo";
}

export default class EmployeeActivityService {
    summarize(projectRoot = null) {
        const employees = defaultEmployees();
        if (!projectRoot) {
            return employees;
        }

        const routingReport = readJson(path.join(projectRoot, "reports", "company", "email", "employee-routing-report.json")) ?? {};
        const activated = routingReport.employeesActivated ?? {};
        const actionsCreated = routingReport.actionsCreated ?? {};
        const departmentsTriggered = routingReport.departmentsTriggered ?? {};

        for (const [employeeName, count] of Object.entries(activated)) {
            employees.employees[normalizeKey(employeeName)].emailsHandled = Number(count ?? 0);
        }

        employees.employees.sales.actionsCreated = Number(actionsCreated.prepare_sales_response ?? 0);
        employees.employees.support.actionsCreated = Number(actionsCreated.draft_reply ?? 0);
        employees.employees.security.actionsCreated = Number(actionsCreated.security_review ?? 0);
        employees.employees.billing.actionsCreated = Number(actionsCreated.billing_review ?? 0);
        employees.employees.ceo.actionsCreated = Number(actionsCreated.executive_insight ?? 0);

        employees.employees.sales.emailsHandled = Math.max(employees.employees.sales.emailsHandled, Number(departmentsTriggered.sales ?? 0));
        employees.employees.support.emailsHandled = Math.max(employees.employees.support.emailsHandled, Number(departmentsTriggered.support ?? 0));
        employees.employees.security.emailsHandled = Math.max(employees.employees.security.emailsHandled, Number(departmentsTriggered.security ?? 0));
        employees.employees.billing.emailsHandled = Math.max(employees.employees.billing.emailsHandled, Number(departmentsTriggered.billing ?? 0));
        employees.employees.ceo.emailsHandled = Math.max(employees.employees.ceo.emailsHandled, Number(departmentsTriggered.ceo ?? 0));
        employees.generatedAt = new Date().toISOString();

        return employees;
    }
}
