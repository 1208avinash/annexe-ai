// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.10
// Engineering Intelligence Engine
// api/agents/engineering-intelligence/worker.js
// ───────────────────────────────────────────────────────────────

const AGENT_ID = "engineering_intelligence_worker";
const VERSION  = "1.0.0";

export async function run(input = {}) {

    const {
        projectId,
        reports = []
    } = input;

    if (!projectId) {
        return {
            success: false,
            agent: AGENT_ID,
            error: "projectId is required."
        };
    }

    let totalScore = 0;

    const findings = [];
    const recommendations = [];
    const categories = [];

    for (const report of reports) {

        if (!report || report.success !== true)
            continue;

        totalScore += Number(report.score || 0);

        categories.push(report.category || report.agent);

        if (Array.isArray(report.findings))
            findings.push(...report.findings);

        if (Array.isArray(report.recommendations))
            recommendations.push(...report.recommendations);

        if (Array.isArray(report.issues))
            findings.push(...report.issues);

        if (Array.isArray(report.risks))
            findings.push(...report.risks);

    }

    const averageScore =
        reports.length
            ? Math.round(totalScore / reports.length)
            : 0;

    let decision = "PASS";

    if (averageScore < 80)
        decision = "REVIEW";

    if (averageScore < 60)
        decision = "BLOCK";

    return {

        success: true,

        agent: AGENT_ID,

        version: VERSION,

        projectId,

        engineeringScore: averageScore,

        decision,

        evaluatedCategories: categories,

        findings,

        recommendations,

        reportCount: reports.length,

        _meta: {

            generatedAt: new Date().toISOString(),

            rc: "RC-5.10"

        }

    };

}

export default run;