// ── ANNEXE AI — Project Factory Test ─────────────────────────────────────────
//
// Place at project root and run:
//   node test-project-factory.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { createProjectFactory } from "./lib/projects/factory.js";


// ── Test input ────────────────────────────────────────────────────────────────

const input = {
  clientName:  "Test Client",
  companyName: "Test Company",
  industry:    "SaaS",
  challenge:   "Need CRM automation and lead management",
  solution:    "AI CRM with lead qualification and automated follow-up"
};


// ── Assertions ────────────────────────────────────────────────────────────────

function assert(label, condition, actual) {
  const icon = condition ? "✅" : "❌";
  console.log(`${icon}  ${label}${condition ? "" : `  →  got: ${JSON.stringify(actual)}`}`);
  return condition;
}


// ── Run ───────────────────────────────────────────────────────────────────────

async function runTest() {

  console.log("\n══════════════════════════════════════════════");
  console.log("  ANNEXE AI — Project Factory Test");
  console.log("══════════════════════════════════════════════\n");

  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("\n── Running factory...\n");

  const result = await createProjectFactory(input);

  console.log("\n── Factory result received.\n");


  // ── Core assertions ───────────────────────────────────────────────────────

  console.log("Factory Result:");
  assert("factory returns success",       result.success === true,               result.success);
  assert("message is a string",           typeof result.message === "string",    typeof result.message);
  assert("project object present",        !!result.project,                      null);
  assert("projectId exists",              !!result.project?.projectId,           result.project?.projectId);
  assert("pipeline object present",       !!result.pipeline,                     null);
  assert("pipelineStatus present",        !!result.pipeline?.pipelineStatus,     null);
  assert("agentRuns array present",       Array.isArray(result.pipeline?.agentRuns), null);
  assert("finalStatus present",           !!result.pipeline?.finalStatus,        result.pipeline?.finalStatus);


  // ── Project state ─────────────────────────────────────────────────────────

  console.log("\nProject State:");
  assert("clientName preserved",          result.project?.clientName  === input.clientName,  result.project?.clientName);
  assert("companyName preserved",         result.project?.companyName === input.companyName, result.project?.companyName);
  assert("challenge preserved",           result.project?.challenge   === input.challenge,   result.project?.challenge);
  assert("solution preserved",            result.project?.solution    === input.solution,    result.project?.solution);
  assert("requirements extracted",        !!result.project?.requirements,        null);
  assert("technology stack present",      !!result.project?.technology,          null);
  assert("architecture present",          !!result.project?.architecture,        null);
  assert("development plan present",      !!result.project?.developmentPlan,     null);
  assert("estimation present",            !!result.project?.estimation,          null);
  assert("proposal present",              !!result.project?.proposal,            null);
  assert("paymentGate present",           !!result.project?.paymentGate,         null);


  // ── Pipeline status ───────────────────────────────────────────────────────

  const ps = result.pipeline?.pipelineStatus;

  console.log("\nPipeline Status:");
  assert("requirement_agent completed",   ps?.requirement_agent === "completed", ps?.requirement_agent);
  assert("product_agent completed",       ps?.product_agent     === "completed", ps?.product_agent);
  assert("technology_agent completed",    ps?.technology_agent  === "completed", ps?.technology_agent);
  assert("architect_agent completed",     ps?.architect_agent   === "completed", ps?.architect_agent);
  assert("developer_agent completed",     ps?.developer_agent   === "completed", ps?.developer_agent);
  assert("estimation_agent completed",    ps?.estimation_agent  === "completed", ps?.estimation_agent);
  assert("proposal_agent completed",      ps?.proposal_agent    === "completed", ps?.proposal_agent);
  assert("payment_gate completed",        ps?.payment_gate      === "completed", ps?.payment_gate);


  // ── Payment lock (no approval/payment provided) ───────────────────────────

  console.log("\nPayment Gate:");
  assert("finalStatus → awaiting_payment",     result.pipeline?.finalStatus === "awaiting_payment",              result.pipeline?.finalStatus);
  assert("developmentUnlocked → false",        result.project?.paymentGate?.developmentUnlocked === false,       result.project?.paymentGate?.developmentUnlocked);


  // ── Agent run records ─────────────────────────────────────────────────────

  console.log("\nAgent Run Records:");
  assert("8 run records created",         result.pipeline?.agentRuns?.length === 8, result.pipeline?.agentRuns?.length);

  for (const run of result.pipeline?.agentRuns || []) {
    const icon = run.status === "completed" ? "✅" : "❌";
    console.log(`  ${icon}  ${run.agentName.padEnd(22)} ${run.status.padEnd(12)} ${run.durationMs}ms`);
  }


  // ── Snapshots ─────────────────────────────────────────────────────────────

  const est = result.project?.estimation;
  if (est) {
    console.log("\nEstimation:");
    console.log("  Complexity:  ", est.complexity);
    console.log("  Weeks:       ", est.estimatedWeeks);
    console.log("  Cost:        ", est.currency, est.estimatedCost?.toLocaleString());
    console.log("  Confidence:  ", est.confidenceScore + "%");
  }

  const proposal = result.project?.proposal;
  if (proposal) {
    console.log("\nProposal:");
    console.log("  Title:       ", proposal.title);
    console.log("  Timeline:    ", proposal.timeline);
    console.log("  Investment:  ", proposal.currency, proposal.investment?.toLocaleString());
  }


  // ── Result ────────────────────────────────────────────────────────────────

  console.log("\n══════════════════════════════════════════════");
  console.log(result.success ? "  ✅  Factory test passed" : "  ❌  Factory test failed");
  console.log("  Project ID:  ", result.project?.projectId);
  console.log("  Message:     ", result.message);
  console.log("  Final status:", result.pipeline?.finalStatus);
  console.log("══════════════════════════════════════════════\n");

  if (!result.success) {
    process.exit(1);
  }

}

runTest().catch(err => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
