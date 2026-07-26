// ── ANNEXE AI — Agent Orchestrator Pipeline ───────────────────────────────────
//
// File location in project:  api/orchestrator/pipeline.js
//
// Central controller for the full 8-agent execution sequence.
//
// Execution order:
//   1. Requirement Agent          api/agents/requirements/index.js
//   2. Product Intelligence Agent api/agents/product/intelligence.js
//   3. Technology Agent           api/agents/technology/intelligence.js
//   4. Architect Agent            api/agents/architect/design.js
//   5. Developer Planning Agent   api/agents/developer/build.js
//   6. Estimation Agent           api/agents/estimation/calculate.js
//   7. Proposal Agent             api/agents/proposal/generate.js
//   8. Payment Gate Agent         api/agents/payment/gate.js
//
// Payment lock rule:
//   After Step 8, if developmentUnlocked === false the pipeline ends with
//   status "awaiting_payment". Phase 3 agents (code gen, deployment) are
//   NOT triggered here.
//
// Error handling:
//   A failing agent marks itself "failed" but does NOT crash the pipeline.
//   Downstream agents receive empty objects and degrade gracefully.
//   If a critical early agent fails the pipeline returns immediately with
//   all downstream agents marked "locked".
//
// ─────────────────────────────────────────────────────────────────────────────

import { runRequirementAgent }         from "../agents/requirements/index.js";
import { runProductIntelligenceAgent } from "../agents/product/intelligence.js";
import { runTechnologyAgent }          from "../agents/technology/intelligence.js";
import { runArchitectAgent }           from "../agents/architect/design.js";
import { runDeveloperAgent }           from "../agents/developer/build.js";
import { runEstimationAgent }          from "../agents/estimation/calculate.js";
import { runProposalAgent }            from "../agents/proposal/generate.js";
import { runPaymentGateAgent }         from "../agents/payment/gate.js";

import {
  createAgentRun,
  completeAgentRun,
  failAgentRun,
  summariseRun
} from "../../memory/agent-run.js";


// ── Initial pipeline status template ─────────────────────────────────────────

function createPipelineStatus() {
  return {
    requirement_agent:  "pending",
    product_agent:      "pending",
    technology_agent:   "pending",
    architect_agent:    "pending",
    developer_agent:    "pending",
    estimation_agent:   "pending",
    proposal_agent:     "pending",
    payment_gate:       "pending"
  };
}


// ── Safe agent runner ─────────────────────────────────────────────────────────
//
// Wraps every agent call with memory tracking and error isolation.
// Returns { success, result, run } — never throws.

async function safeRun({ agentKey, projectId, fn, input }) {

  const run = createAgentRun({
    projectId,
    agentName: agentKey,
    input
  });

  try {

    const result = await fn(input);
    completeAgentRun(run, result);
    return { success: true, result, run };

  } catch (error) {

    failAgentRun(run, error);
    console.error(`[ORCHESTRATOR] ${agentKey} failed:`, error?.message || error);
    return { success: false, result: null, run, error: error?.message || String(error) };

  }

}


// ── Main pipeline ─────────────────────────────────────────────────────────────

/**
 * runProjectPipeline
 *
 * @param {object} project  - Project object (from api/projects/create.js or test)
 *   Expected fields:
 *     projectId, clientName, companyName, industry,
 *     challenge, solution, blueprint
 *   Optional:
 *     approvalStatus  {boolean}  — whether client approved the proposal
 *     paymentStatus   {boolean}  — whether advance payment was received
 *
 * @returns {object}
 *   {
 *     success:        boolean,
 *     project:        object,       // enriched with all agent outputs
 *     pipelineStatus: object,       // per-agent status values
 *     agentRuns:      object[],     // summarised memory records
 *     finalStatus:    string,       // "awaiting_payment" | "development_unlocked"
 *     failedAgent?:   string,
 *     error?:         string
 *   }
 */
export async function runProjectPipeline(project = {}) {

  const projectId      = project.projectId || "ANNEXE-" + Date.now();
  const pipelineStatus = createPipelineStatus();
  const agentRuns      = [];

  // Working copy — enriched throughout the pipeline, never mutates original
  const enriched = { ...project, projectId };

  console.log(`[ORCHESTRATOR] Pipeline started → ${projectId}`);


  // ── STEP 1: Requirement Agent ─────────────────────────────────────────────

  pipelineStatus.requirement_agent = "running";

  const reqStep = await safeRun({
    agentKey: "requirement_agent",
    projectId,
    fn: (input) => runRequirementAgent(input),
    input: {
      message:      enriched.challenge || "",
      conversation: enriched.solution  || "",
      clientInfo: {
        industry:    enriched.industry    || "",
        challenge:   enriched.challenge   || "",
        companyName: enriched.companyName || "",
        role:        enriched.clientRole  || ""
      }
    }
  });

  agentRuns.push(summariseRun(reqStep.run));

  if (!reqStep.success) {
    pipelineStatus.requirement_agent = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "requirement_agent", error: reqStep.error });
  }

  pipelineStatus.requirement_agent = "completed";
  const requirements = reqStep.result.requirements;
  enriched.requirements = requirements;


  // ── STEP 2: Product Intelligence Agent ───────────────────────────────────

  pipelineStatus.product_agent = "running";

  const productStep = await safeRun({
    agentKey: "product_agent",
    projectId,
    fn: (input) => runProductIntelligenceAgent(input),
    input: { requirements }
  });

  agentRuns.push(summariseRun(productStep.run));

  if (!productStep.success) {
    pipelineStatus.product_agent = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "product_agent", error: productStep.error });
  }

  pipelineStatus.product_agent = "completed";
  const productDecision = productStep.result;
  enriched.productDecision = productDecision;


  // ── STEP 3: Technology Agent ──────────────────────────────────────────────

  pipelineStatus.technology_agent = "running";

  const techStep = await safeRun({
    agentKey: "technology_agent",
    projectId,
    fn: (input) => runTechnologyAgent(input),
    input: {
      industry:     enriched.industry || "Not defined",
      solution:     enriched.solution || "Not defined",
      requirements: requirements.features || []
    }
  });

  agentRuns.push(summariseRun(techStep.run));

  if (!techStep.success) {
    pipelineStatus.technology_agent = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "technology_agent", error: techStep.error });
  }

  pipelineStatus.technology_agent = "completed";
  const technology = techStep.result.recommendation;
  enriched.technology = technology;


  // ── STEP 4: Architect Agent ───────────────────────────────────────────────

  pipelineStatus.architect_agent = "running";

  const archStep = await safeRun({
    agentKey: "architect_agent",
    projectId,
    fn: (input) => runArchitectAgent(input),
    input: {
      solution:     enriched.solution || "Not defined",
      technology,
      requirements: requirements.features || []
    }
  });

  agentRuns.push(summariseRun(archStep.run));

  if (!archStep.success) {
    pipelineStatus.architect_agent = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "architect_agent", error: archStep.error });
  }

  pipelineStatus.architect_agent = "completed";
  const architecture = archStep.result.architecture;
  enriched.architecture = architecture;


  // ── STEP 5: Developer Planning Agent ─────────────────────────────────────

  pipelineStatus.developer_agent = "running";

  const devStep = await safeRun({
    agentKey: "developer_agent",
    projectId,
    fn: (input) => runDeveloperAgent(input),
    input: {
      solution:     enriched.solution || "Not defined",
      technology,
      architecture,
      requirements: requirements.features || []
    }
  });

  agentRuns.push(summariseRun(devStep.run));

  if (!devStep.success) {
    pipelineStatus.developer_agent = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "developer_agent", error: devStep.error });
  }

  pipelineStatus.developer_agent = "completed";
  enriched.developmentPlan = devStep.result.developmentPlan;


  // ── STEP 6: Estimation Agent ──────────────────────────────────────────────

  pipelineStatus.estimation_agent = "running";

  const estStep = await safeRun({
    agentKey: "estimation_agent",
    projectId,
    fn: (input) => runEstimationAgent(input),
    input: { productDecision, requirements, technology, projectId }
  });

  agentRuns.push(summariseRun(estStep.run));

  if (!estStep.success) {
    pipelineStatus.estimation_agent = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "estimation_agent", error: estStep.error });
  }

  pipelineStatus.estimation_agent = "completed";
  const estimation = estStep.result.estimation;
  enriched.estimation = estimation;


  // ── STEP 7: Proposal Agent ────────────────────────────────────────────────

  pipelineStatus.proposal_agent = "running";

  const propStep = await safeRun({
    agentKey: "proposal_agent",
    projectId,
    fn: (input) => runProposalAgent(input),
    input: { requirements, productDecision, estimation, technology, projectId }
  });

  agentRuns.push(summariseRun(propStep.run));

  if (!propStep.success) {
    pipelineStatus.proposal_agent = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "proposal_agent", error: propStep.error });
  }

  pipelineStatus.proposal_agent = "completed";
  const proposal = propStep.result.proposal;
  enriched.proposal = proposal;


  // ── STEP 8: Payment Gate Agent ────────────────────────────────────────────
  //
  // approvalStatus and paymentStatus come from the project record.
  // In production these are set by a CRM webhook or admin dashboard action.
  // Default: both false → gate opens to "awaiting_approval".

  pipelineStatus.payment_gate = "running";

  const gateStep = await safeRun({
    agentKey: "payment_gate",
    projectId,
    fn: (input) => runPaymentGateAgent(input),
    input: {
      proposal,
      approvalStatus: enriched.approvalStatus || false,
      paymentStatus:  enriched.paymentStatus  || false,
      projectId
    }
  });

  agentRuns.push(summariseRun(gateStep.run));

  if (!gateStep.success) {
    pipelineStatus.payment_gate = "failed";
    return buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent: "payment_gate", error: gateStep.error });
  }

  pipelineStatus.payment_gate = "completed";
  const paymentGate = gateStep.result.payment;
  enriched.paymentGate = paymentGate;


  // ── Resolve final status ──────────────────────────────────────────────────
  //
  // PAYMENT LOCK RULE:
  //   developmentUnlocked === false  →  "awaiting_payment"  (pipeline ends here)
  //   developmentUnlocked === true   →  "development_unlocked"
  //   Phase 3 agents belong to a future pipeline extension.

  const developmentUnlocked = paymentGate?.developmentUnlocked === true;
  const finalStatus = developmentUnlocked ? "development_unlocked" : "awaiting_payment";

  enriched.status       = finalStatus;
  enriched.currentAgent = developmentUnlocked ? "developer_agent" : "payment_gate";
  enriched.updatedAt    = new Date().toISOString();

  console.log(`[ORCHESTRATOR] Pipeline complete → ${finalStatus}`);

  return {
    success: true,
    project: enriched,
    pipelineStatus,
    agentRuns,
    finalStatus
  };

}


// ── Failure response builder ──────────────────────────────────────────────────

function buildFailureResponse({ enriched, pipelineStatus, agentRuns, failedAgent, error }) {

  let reached = false;
  for (const key of Object.keys(pipelineStatus)) {
    if (key === failedAgent) { reached = true; continue; }
    if (reached && pipelineStatus[key] === "pending") {
      pipelineStatus[key] = "locked";
    }
  }

  enriched.status    = "pipeline_failed";
  enriched.updatedAt = new Date().toISOString();

  console.error(`[ORCHESTRATOR] Pipeline failed at ${failedAgent}: ${error}`);

  return { success: false, project: enriched, pipelineStatus, agentRuns, failedAgent, error };

}
