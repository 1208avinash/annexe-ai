// ── ANNEXE AI — Project Creation HTTP Handler ─────────────────────────────────
//
// File location in project:  api/projects/create.js
//
// Responsibility: HTTP only.
//   - Receive and validate the POST request
//   - Delegate to createProjectFactory()
//   - Return response
//
// All project creation and agent execution logic lives in:
//   api/projects/factory.js  →  api/orchestrator/pipeline.js  →  agents
//
// ─────────────────────────────────────────────────────────────────────────────

import { createProjectFactory } from "./factory.js";


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

    // ── Validation (unchanged from previous create.js) ────────────────────

    if (!clientName && !companyName) {
      return res.status(400).json({ error: "Client information required" });
    }


    // ── Delegate to factory ───────────────────────────────────────────────

    const result = await createProjectFactory({
      clientName,
      companyName,
      industry,
      challenge,
      solution,
      blueprint
    });


    // ── Return response (same shape as before for frontend compatibility) ──

    return res.status(200).json({
      success: result.success,
      message: result.message,
      project: result.project,
      pipeline: result.pipeline   // new: pipeline metadata available to callers
    });


  } catch (error) {

    console.error("PROJECT ENGINE ERROR:", error);

    return res.status(500).json({ error: "Project creation failed" });

  }

}
