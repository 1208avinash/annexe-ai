export default function statusCommand(context = {}) {
    const emailStatus = context.emailDepartment ? "ACTIVE" : "INACTIVE";
    const employeesStatus = context.employeeStatus ?? "READY";
    const systemsStatus = context.systemStatus ?? "ONLINE";

    return {
        command: "/status",
        message: [
            "ANNEXE AI STATUS",
            "",
            `Email Intelligence:`,
            `${emailStatus}`,
            "",
            `AI Employees:`,
            `${employeesStatus}`,
            "",
            `Systems:`,
            `${systemsStatus}`
        ].join("\n")
    };
}
