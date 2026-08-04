// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-6.1
// Requirement Intelligence Worker
// ───────────────────────────────────────────────────────────────
//
// Analyses project requirements before engineering begins.
//
// Responsibilities:
//
// • Understand project
// • Detect project type
// • Score completeness
// • Detect missing information
// • Generate clarification questions
// • Decide engineering readiness
//
// Never generates code.
// ───────────────────────────────────────────────────────────────

import {
    createRequirementReport,
    READINESS
} from "./schema.js";

import {
    DEFAULT_QUESTIONS,
    COMPLETENESS_RULES
} from "./prompts.js";

export async function run(input = {}) {

    const report = createRequirementReport(input.projectId || null);

    const requirement =
        (input.requirement || "").toLowerCase();

    // ----------------------------------------------------------
    // Project Type Detection
    // ----------------------------------------------------------

    if (requirement.includes("ecommerce")) {

        report.report.projectType = "Ecommerce";

    } else if (requirement.includes("crm")) {

        report.report.projectType = "CRM";

    } else if (requirement.includes("erp")) {

        report.report.projectType = "ERP";

    } else if (requirement.includes("marketplace")) {

        report.report.projectType = "Marketplace";

    } else if (requirement.includes("ai")) {

        report.report.projectType = "AI Platform";

    } else {

        report.report.projectType = "General Software";

    }

    // ----------------------------------------------------------
    // Business Goal
    // ----------------------------------------------------------

    report.report.businessGoal =
        input.requirement || "";

    // ----------------------------------------------------------
    // Basic Completeness
    // ----------------------------------------------------------

    report.completeness.business =
        input.requirement ? 100 : 0;

    report.completeness.functional =
        input.requirement ? 70 : 0;

    report.completeness.technical =
        input.requirement ? 40 : 0;

    report.completeness.security = 20;
    report.completeness.performance = 20;
    report.completeness.deployment = 10;
    report.completeness.compliance = 0;
    report.completeness.timeline = 0;
    report.completeness.budget = 0;

    const values = Object.values(report.completeness)
        .filter(v => typeof v === "number");

    report.completeness.overall =
        Math.round(
            values.reduce((a, b) => a + b, 0) /
            values.length
        );

    // ----------------------------------------------------------
    // Missing Information
    // ----------------------------------------------------------

    if (!input.timeline)
        report.missing.push("Timeline");

    if (!input.budget)
        report.missing.push("Budget");

    if (!input.security)
        report.missing.push("Security Requirements");

    if (!input.deployment)
        report.missing.push("Deployment Strategy");

    if (!input.authentication)
        report.missing.push("Authentication");

    // ----------------------------------------------------------
    // Questions
    // ----------------------------------------------------------

    report.questions.push(...DEFAULT_QUESTIONS);

    // ----------------------------------------------------------
    // Readiness
    // ----------------------------------------------------------

    const score =
        report.completeness.overall;

    if (score >= COMPLETENESS_RULES.READY) {

        report.ready = true;
        report.readiness = READINESS.READY;

    } else if (
        score >= COMPLETENESS_RULES.READY_WITH_WARNINGS
    ) {

        report.ready = true;
        report.readiness =
            READINESS.READY_WITH_WARNINGS;

    } else if (
        score >= COMPLETENESS_RULES.NEEDS_CLARIFICATION
    ) {

        report.ready = false;
        report.readiness =
            READINESS.NEEDS_CLARIFICATION;

    } else {

        report.ready = false;
        report.readiness =
            READINESS.NOT_READY;

    }

    // ----------------------------------------------------------
    // Recommendations
    // ----------------------------------------------------------

    if (!report.ready) {

        report.recommendations.push(
            "Collect missing engineering requirements before planning."
        );

    } else {

        report.recommendations.push(
            "Engineering planning may begin."
        );

    }

    report.report.confidence =
        report.completeness.overall;

    return report;

}

export default {

    run

};