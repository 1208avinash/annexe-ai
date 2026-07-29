// ── ANNEXE AI — Delivery Worker ───────────────────────────────────────────────
//
// Pure formatter / packager.  No external API calls, no imports from other
// workers.  Receives completed factory output and returns a structured
// client-ready delivery package.
//
// Input shape:
//   {
//     projectId,
//     architecture,
//     backendPlan,
//     frontendPlan,
//     generationResult,
//     repositoryResult,
//     tests,      // optional
//     reviews     // optional
//   }
//
// Output shape:
//   {
//     success: true,
//     agent:   "delivery_worker",
//     status:  "READY_FOR_CLIENT",
//     deliveryPackage: {
//       projectSummary,
//       architectureDocument,
//       generatedFiles,
//       testReport,
//       repositoryInfo,
//       deploymentGuide
//     }
//   }
//
// ─────────────────────────────────────────────────────────────────────────────


export function runDeliveryWorker({
  projectId,
  architecture,
  backendPlan,
  frontendPlan,
  generationResult,
  repositoryResult,
  tests    = null,
  reviews  = null
} = {}) {


  // ── Guard: generationResult is the minimum required artifact ─────────────

  if (!generationResult) {
    return {
      success: false,
      agent:   "delivery_worker",
      status:  "DELIVERY_FAILED",
      error:   "generationResult is required — factory output incomplete",
      deliveryPackage: null
    };
  }


  // ── 1. Project summary ────────────────────────────────────────────────────

  const projectSummary = {
    projectId:   projectId || "UNKNOWN",
    generatedAt: new Date().toISOString(),
    frontend:    architecture?.frontend?.framework  || frontendPlan?.framework  || "Not specified",
    backend:     architecture?.backend?.framework   || backendPlan?.framework   || "Not specified",
    database:    architecture?.database?.engine                                 || "Not specified",
    modules:     [
      ...(architecture?.frontend?.modules  || []),
      ...(architecture?.backend?.services  || []),
      ...(architecture?.database?.tables   || [])
    ],
    totalGeneratedFiles: generationResult?.files?.length
      ?? generationResult?.generatedFiles?.length
      ?? 0
  };


  // ── 2. Architecture document ──────────────────────────────────────────────

  const architectureDocument = {
    frontend: {
      framework: architecture?.frontend?.framework  || "Not specified",
      modules:   architecture?.frontend?.modules    || []
    },
    backend: {
      framework: architecture?.backend?.framework   || "Not specified",
      services:  architecture?.backend?.services    || []
    },
    database: {
      engine: architecture?.database?.engine        || "Not specified",
      tables: architecture?.database?.tables        || []
    },
    aiArchitecture: {
      components: architecture?.aiArchitecture?.components || []
    },
    integrations: architecture?.integrations || []
  };


  // ── 3. Generated files inventory ─────────────────────────────────────────
  //
  // generationResult may store files as .files or .generatedFiles depending
  // on the generation worker version — handle both.

  const rawFiles =
    generationResult?.files          ||
    generationResult?.generatedFiles ||
    [];

  const generatedFiles = rawFiles.map(f => ({
    path:     f.path     || f.filePath || f.name || "unknown",
    type:     f.type     || f.fileType || "file",
    status:   f.status   || "generated",
    sizeHint: f.sizeHint || f.size     || null
  }));


  // ── 4. Test report ────────────────────────────────────────────────────────

  const testReport = {
    available: !!tests,
    summary:   tests?.summary   || (tests ? "Tests completed" : "No test data provided"),
    passed:    tests?.passed    ?? null,
    failed:    tests?.failed    ?? null,
    coverage:  tests?.coverage  ?? null,
    suites:    tests?.suites    || []
  };


  // ── 5. Repository info ────────────────────────────────────────────────────

  const repositoryInfo = {
    available:     !!repositoryResult,
    repositoryUrl: repositoryResult?.repositoryUrl
      || repositoryResult?.repositoryState?.repositoryUrl
      || null,
    branch:        repositoryResult?.workingBranch
      || repositoryResult?.repositoryState?.workingBranch
      || null,
    pullRequest:   repositoryResult?.pullRequest
      || repositoryResult?.repositoryState?.pullRequest
      || null,
    status:        repositoryResult?.status
      || repositoryResult?.repositoryState?.status
      || "not_available"
  };


  // ── 6. Deployment guide ───────────────────────────────────────────────────

  const framework   = architecture?.backend?.framework || backendPlan?.framework || "";
  const dbEngine    = architecture?.database?.engine   || "";
  const feFramework = architecture?.frontend?.framework || frontendPlan?.framework || "";

  const deploymentGuide = {
    steps: [
      "1. Clone the repository from the provided branch",
      `2. Install backend dependencies (${framework || "see project README"})`,
      `3. Configure environment variables — database (${dbEngine || "see schema"}), API keys`,
      `4. Run database migrations`,
      `5. Start backend service`,
      `6. Install frontend dependencies (${feFramework || "see project README"})`,
      `7. Build and serve frontend`,
      "8. Verify all health-check endpoints",
      "9. Review pull request and merge to main when approved"
    ],
    notes: [
      "This guide is auto-generated from factory output.",
      "Review all environment variables before deployment.",
      "Do not merge the pull request without human code review."
    ]
  };


  // ── Assemble delivery package ─────────────────────────────────────────────

  const deliveryPackage = {
    projectSummary,
    architectureDocument,
    generatedFiles,
    testReport,
    repositoryInfo,
    deploymentGuide
  };


  return {
    success: true,
    agent:   "delivery_worker",
    status:  "READY_FOR_CLIENT",
    deliveryPackage,
    _meta: {
      projectId:          projectId || "UNKNOWN",
      generatedAt:        projectSummary.generatedAt,
      totalFiles:         generatedFiles.length,
      repositoryAttached: repositoryInfo.available,
      testsAttached:      testReport.available
    }
  };

}


// ── HTTP handler (for direct Vercel route testing) ────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      projectId,
      architecture,
      backendPlan,
      frontendPlan,
      generationResult,
      repositoryResult,
      tests,
      reviews
    } = req.body || {};

    const result = runDeliveryWorker({
      projectId,
      architecture,
      backendPlan,
      frontendPlan,
      generationResult,
      repositoryResult,
      tests,
      reviews
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {

    console.error("DELIVERY WORKER ERROR:", error);

    return res.status(500).json({ error: "Delivery worker failed" });

  }

}
