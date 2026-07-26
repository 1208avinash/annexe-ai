import { runTechnologyAgent } from "../agents/technology/intelligence.js";
import { runArchitectAgent }  from "../agents/architect/design.js";
import { runDeveloperAgent }  from "../agents/developer/build.js";
import { createProjectSchema } from "./schema.js";


export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      clientName,
      companyName,
      industry,
      challenge,
      solution,
      blueprint
    } = req.body || {};

    if (!clientName && !companyName) {
      return res.status(400).json({ error: "Client information required" });
    }


    // ── Initialise project using central schema ────────────────────────────────

    const project = createProjectSchema({
      clientName,
      companyName,
      industry,
      status:       "architecture_pending",
      currentAgent: "technology_agent"
    });

    // Preserve legacy fields used by the chat layer
    project.challenge = challenge || "Not defined";
    project.solution  = solution  || "Not defined";
    project.blueprint = blueprint || {};

    console.log("ANNEXE PROJECT CREATED:", project.projectId);


    // ── Stage 1: Technology Intelligence Agent ────────────────────────────────

    let technology = null;

    try {

      const techResult = runTechnologyAgent({
        industry:     industry  || "Not defined",
        solution:     solution  || "Not defined",
        requirements: []
      });

      if (techResult.success) {
        technology         = techResult.recommendation;
        project.technology = technology;
        console.log("TECHNOLOGY AGENT OK");
      }

    } catch (techError) {
      console.error("TECHNOLOGY AGENT FAILED:", techError);
    }


    // ── Stage 2: Architect Agent ──────────────────────────────────────────────

    let architecture = null;

    try {

      const archResult = runArchitectAgent({
        solution:     solution || "Not defined",
        technology,
        requirements: []
      });

      if (archResult.success) {
        architecture         = archResult.architecture;
        project.architecture = architecture;
        console.log("ARCHITECT AGENT OK");
      }

    } catch (archError) {
      console.error("ARCHITECT AGENT FAILED:", archError);
    }


    // ── Stage 3: Developer Agent ──────────────────────────────────────────────

    let developmentPlan = null;

    try {

      const devResult = runDeveloperAgent({
        solution:     solution || "Not defined",
        technology,
        architecture,
        requirements: []
      });

      if (devResult.success) {
        developmentPlan         = devResult.developmentPlan;
        project.developmentPlan = developmentPlan;
        console.log("DEVELOPER AGENT OK");
      }

    } catch (devError) {
      console.error("DEVELOPER AGENT FAILED:", devError);
    }


    // ── Resolve final status ──────────────────────────────────────────────────

    const architectureReady = technology    !== null && architecture  !== null;
    const developmentReady  = architectureReady      && developmentPlan !== null;

    project.status       = developmentReady  ? "development_ready"  :
                           architectureReady ? "architecture_ready" :
                                              "architecture_failed";

    project.currentAgent = developmentReady  ? "qa_agent"       :
                           architectureReady ? "developer_agent" :
                                              "manual_review";

    project.updatedAt = new Date().toISOString();

    console.log("ANNEXE FINAL PROJECT STATUS:", project.status);

    return res.status(200).json({
      success: true,
      message: developmentReady
        ? "ANNEXE project created and development plan ready"
        : architectureReady
        ? "ANNEXE project created — developer agent failed"
        : "ANNEXE project created — architecture generation failed",
      project
    });


  } catch (error) {

    console.error("PROJECT ENGINE ERROR:", error);

    return res.status(500).json({ error: "Project creation failed" });

  }

}
