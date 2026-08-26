function buildActionPlan({ classification, priority, department, signals = {} }) {
    if (classification?.type === "BUG") {
        return [
            "Acknowledge the incident immediately.",
            "Reproduce the login or dashboard failure.",
            "Inspect authentication, session, and dashboard access paths.",
            "Restore access and validate the fix with a customer account.",
            "Confirm resolution and communicate the outcome."
        ];
    }

    if (department === "Billing") {
        return [
            "Review the billing request details.",
            "Validate the customer account and transaction history.",
            "Resolve the billing issue or route to finance.",
            "Confirm closure with the customer."
        ];
    }

    if (priority === "HIGH" || signals.mentionsUrgent) {
        return [
            "Triage the request immediately.",
            "Assign an owner and confirm next steps.",
            "Resolve the issue or provide a clear workaround.",
            "Follow up until the customer confirms success."
        ];
    }

    return [
        "Review the request.",
        "Assign the appropriate owner.",
        "Respond with the next action.",
        "Close the request after confirmation."
    ];
}

export default class CustomerServiceReport {
    create(input = {}) {
        const reportId = `CSR-${Date.now()}`;
        const actionPlan = input.actionPlan ?? buildActionPlan(input);

        return {
            reportId,
            requestText: input.requestText ?? "",
            classification: input.classification ?? { type: "REQUEST" },
            priority: input.priority ?? "MEDIUM",
            assignedDepartment: input.assignedDepartment ?? "Operations",
            actionPlan,
            summary: `Customer request classified as ${input.classification?.type ?? "REQUEST"} with ${input.priority ?? "MEDIUM"} priority for ${input.assignedDepartment ?? "Operations"}.`,
            recommendations: [
                "Record the request in customer intelligence memory.",
                "Route the request to the assigned department.",
                "Keep the customer informed until the case is closed."
            ],
            metadata: {
                customer: input.customer ?? null,
                project: input.project ?? null,
                receivedAt: input.receivedAt ?? null,
                analyzedAt: new Date().toISOString()
            }
        };
    }
}
