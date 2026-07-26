import { runTechnologyAgent } from "../agents/technology/intelligence.js";
import { runArchitectAgent }  from "../agents/architect/design.js";


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

    const projectId = "ANNEXE-" + Date.now();

    const project = {
      projectId,
      clientName:  clientName  || "Unknown",
      companyName: companyName || "Unknown",
      industry:    industry    || "Not defined",
      challenge:   challenge   || "Not defined",
      solution:    solution    || "Not defined",
      blueprint:   blueprint   || {},
      status:      "architecture_pending",
      nextAgent:   "architect_agent",
      createdAt:   new Date().toISOString()
    };

    console.log("ANNEXE PROJECT CREATED:", project.projectId);


    // ── Stage 1: Technology Intelligence Agent ────────────────────────────────

    let technology = null;

    try {

      const techResult = runTechnologyAgent({
        industry:     project.industry,
        solution:     project.solution,
        requirements: []
      });

      if (techResult.success) {
        technology = techResult.recommendation;
        console.log("TECHNOLOGY AGENT OK");
      }

    } catch (techError) {
      console.error("TECHNOLOGY AGENT FAILED:", techError);
    }


    // ── Stage 2: Architect Agent ──────────────────────────────────────────────

    let architecture = null;

    try {

      const archResult = runArchitectAgent({
        solution:     project.solution,
        technology,
        requirements: []
      });

      if (archResult.success) {
        architecture = archResult.architecture;
        console.log("ARCHITECT AGENT OK");
      }

    } catch (archError) {
      console.error("ARCHITECT AGENT FAILED:", archError);
    }


    // ── Assemble final project ────────────────────────────────────────────────

    const architectureReady = technology !== null && architecture !== null;

    const finalProject = {
      ...project,
      technology:   technology   || null,
      architecture: architecture || null,
      status:    architectureReady ? "architecture_ready" : "architecture_failed",
      nextAgent: architectureReady ? "developer_agent"    : "manual_review"
    };

    console.log("ANNEXE FINAL PROJECT STATUS:", finalProject.status);

    return res.status(200).json({
      success: true,
      message: architectureReady
        ? "ANNEXE project created and architecture ready"
        : "ANNEXE project created — architecture generation failed",
      project: finalProject
    });


  } catch (error) {

    console.error("PROJECT ENGINE ERROR:", error);

    return res.status(500).json({ error: "Project creation failed" });

  }

}