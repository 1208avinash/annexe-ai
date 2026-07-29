// ── ANNEXE AI — Agent Adapters ────────────────────────────────────────────────
//
// Translates generic task inputs from the WorkflowRunner into the exact
// argument shape each agent function expects, then calls it.
//
// Pipeline context flow:
//
//   architect_worker  → projectContextManager.addArchitecture()
//                                ↓
//   backend_worker    → projectContextManager.addBackendPlan()
//                                ↓
//   frontend_worker   ← reads architecture + backendPlan
//                    → runFrontendEngineerAgent()
//                    → runFrontendEnhancerAgent()
//                    → projectContextManager.addFrontendPlan()
//                                ↓
//   testing_worker    → projectContextManager.addTests()
//                                ↓
//   review_worker     → projectContextManager.addReviews()
//
// Rules:
//   - Do NOT change agent logic (engineer functions).
//   - Do NOT change engine.js / executor.js / workflow-runner.js.
//   - Keep adapter pattern. Keep backward compatibility.
//
// ─────────────────────────────────────────────────────────────────────────────

import { projectContextManager }    from "./context.js";

import { runArchitectAgent }         from "../agents/architect/design.js";
import { runBackendEngineerAgent }   from "../agents/backend/engineer.js";
import { runBackendEnhancerAgent }   from "../agents/backend/enhancer-agent.js";
import { runFrontendEngineerAgent }  from "../agents/frontend/engineer.js";
import { runFrontendEnhancerAgent }  from "../agents/frontend/enhancer-agent.js";
import { runTechnologyAgent }        from "../agents/technology/intelligence.js";
import { runBackendGenerationPipeline }  from "../generation/pipeline.js";
import { runFrontendGenerationPipeline } from "../generation/frontend/pipeline.js";
import { integrateGenerationResult }     from "../repository/integration.js";

// Testing / review / AI workers are not yet built.
// Inline stubs stand in until the real agent files exist.
// To activate: replace each stub with a real import and delete the stub function.

function runTestingAgent(input) {
  console.log("[STUB] testing_worker — agent not yet implemented");
  return { success: true, agent: "testing_agent_stub", tests: [] };
}

function runReviewAgent(input) {
  console.log("[STUB] review_worker — agent not yet implemented");
  return { success: true, agent: "review_agent_stub", reviews: [] };
}

function runAIEngineerAgent(input) {
  console.log("[STUB] ai_worker — agent not yet implemented");
  return { success: true, agent: "ai_engineer_agent_stub", aiPlan: {} };
}


// ── Main dispatch ─────────────────────────────────────────────────────────────

export async function runAgentAdapter(workerType, taskInput) {

  switch (workerType) {


    // ── Architect ─────────────────────────────────────────────────────────────

    case "architect_worker": {

      const result = runArchitectAgent({
        solution:     taskInput.solution     || null,
        technology:   taskInput.technology   || null,
        requirements: taskInput.requirements || []
      });

      if (result.success && result.architecture) {
        projectContextManager.addArchitecture(
          taskInput.projectId,
          result.architecture
        );
      }

      return result;

    }


    // ── Backend ───────────────────────────────────────────────────────────────
    //
    // Reads architecture from context if not in taskInput.
    // Runs enhancer after engineer, merges enhancements.
    // Stores final backendPlan in context for frontend_worker to consume.

    case "backend_worker": {

      const ctx = projectContextManager.get(taskInput.projectId);

      const result = runBackendEngineerAgent({
        projectId:    taskInput.projectId,
        solution:     taskInput.solution     || null,
        architecture: taskInput.architecture || ctx.architecture || null,
        requirements: taskInput.requirements || [],
        technology:   taskInput.technology   || null
      });

      // ── Enhance backend plan ───────────────────────────────────────────────
      if (result.success && result.backendPlan) {
        const enhancement = await runBackendEnhancerAgent({
          backendPlan:  result.backendPlan,
          architecture: taskInput.architecture || ctx.architecture || null,
          requirements: taskInput.requirements || []
        });

        if (enhancement.success) {
          result.backendPlan = {
            ...result.backendPlan,
            enhancements: enhancement.enhancements
          };
        }
      }

      // ── Store in context ───────────────────────────────────────────────────
      if (result.success && result.backendPlan) {
        projectContextManager.addBackendPlan(
          taskInput.projectId,
          result.backendPlan
        );
        console.log("[BACKEND ADAPTER] Backend generation completed");
      }

      return result;

    }


    // ── Frontend ──────────────────────────────────────────────────────────────
    //
    // Enriches input with architecture + backendPlan from context.
    // Runs enhancer after engineer, merges enhancements.
    // Stores final frontendPlan in context.

    case "frontend_worker": {

      const ctx = projectContextManager.get(taskInput.projectId);

      const enrichedInput = {
        ...taskInput,
        architecture: taskInput.architecture || ctx.architecture || null,
        backendPlan:  taskInput.backendPlan  || ctx.backendPlan  || null,
        context:      ctx
      };

      console.log("[FRONTEND ADAPTER INPUT]", {
        projectId:       enrichedInput.projectId,
        hasArchitecture: !!enrichedInput.architecture,
        hasBackendPlan:  !!enrichedInput.backendPlan
      });

      const result = runFrontendEngineerAgent(enrichedInput);

      // ── Enhance frontend plan ──────────────────────────────────────────────
      if (result.success && result.frontendPlan) {
        const enhancement = await runFrontendEnhancerAgent({
          frontendPlan: result.frontendPlan,
          backendPlan:  enrichedInput.backendPlan,
          architecture: enrichedInput.architecture,
          requirements: taskInput.requirements || {}
        });

        if (enhancement.success) {
          result.frontendPlan = {
            ...result.frontendPlan,
            enhancements: enhancement.enhancements
          };
        }
      }

      // ── Store in context ───────────────────────────────────────────────────
      if (result.success && result.frontendPlan) {
        projectContextManager.addFrontendPlan(
          taskInput.projectId,
          result.frontendPlan
        );
        console.log("[FRONTEND ADAPTER] Frontend generation completed");
      }

      return result;

    }


    // ── Technology Intelligence ───────────────────────────────────────────────

    case "technology_worker": {

      const result = runTechnologyAgent({
        industry:     taskInput.industry     || null,
        solution:     taskInput.solution     || null,
        requirements: taskInput.requirements || []
      });

      return result;

    }


    // ── AI Engineer ───────────────────────────────────────────────────────────

    case "ai_worker": {

      const ctx = projectContextManager.get(taskInput.projectId);

      const result = runAIEngineerAgent({
        project:      taskInput.project      || { projectId: taskInput.projectId },
        technology:   taskInput.technology   || null,
        requirements: taskInput.requirements || {},
        architecture: taskInput.architecture || ctx.architecture || null
      });

      return result;

    }


    // ── Testing ───────────────────────────────────────────────────────────────

    case "testing_worker": {

      const ctx = projectContextManager.get(taskInput.projectId);

      const result = runTestingAgent({
        ...taskInput,
        architecture: taskInput.architecture || ctx.architecture  || null,
        backendPlan:  taskInput.backendPlan  || ctx.backendPlan   || null,
        frontendPlan: taskInput.frontendPlan || ctx.frontendPlan  || null
      });

      if (result.success && result.tests) {
        projectContextManager.addTests(taskInput.projectId, result.tests);
      }

      return result;

    }


    // ── Review ────────────────────────────────────────────────────────────────

    case "review_worker": {

      const ctx = projectContextManager.get(taskInput.projectId);

      const result = runReviewAgent({
        ...taskInput,
        architecture: taskInput.architecture || ctx.architecture  || null,
        backendPlan:  taskInput.backendPlan  || ctx.backendPlan   || null,
        frontendPlan: taskInput.frontendPlan || ctx.frontendPlan  || null,
        tests:        taskInput.tests        || ctx.tests         || []
      });

      if (result.success && result.reviews) {
        projectContextManager.addReviews(taskInput.projectId, result.reviews);
      }

      return result;

    }


    // ── Generation ───────────────────────────────────────────────────────────
    //
    // Reads backendPlan + frontendPlan from context.
    // Runs backend generation pipeline, then frontend generation pipeline.
    // Combines generatedFiles from both into a single array.
    // Does NOT touch repository, Git, or GitHub.

    case "generation_worker": {

      const ctx = projectContextManager.get(taskInput.projectId);

      const backendPlan  = taskInput.backendPlan  || ctx.backendPlan  || null;
      const frontendPlan = taskInput.frontendPlan || ctx.frontendPlan || null;

      console.log("[GENERATION ADAPTER INPUT]", {
        projectId:       taskInput.projectId,
        hasBackendPlan:  !!backendPlan,
        hasFrontendPlan: !!frontendPlan
      });

      // ── Backend generation ─────────────────────────────────────────────────
      const backendResult = runBackendGenerationPipeline({
        projectId:   taskInput.projectId,
        backendPlan
      });

      // ── Frontend generation ────────────────────────────────────────────────
      const frontendResult = runFrontendGenerationPipeline({
        projectId:   taskInput.projectId,
        frontendPlan
      });

      // ── Combine generated files ────────────────────────────────────────────
      const generatedFiles = [
        ...(backendResult.generatedFiles  || []),
        ...(frontendResult.generatedFiles || [])
      ];

      const success =
        (backendResult.success  !== false) &&
        (frontendResult.success !== false);

      console.log("[GENERATION ADAPTER] Generation completed", {
        backendSuccess:  backendResult.success,
        frontendSuccess: frontendResult.success,
        totalFiles:      generatedFiles.length
      });

      return {
        success,
        agent:            "generation_worker",
        backendGeneration:  backendResult,
        frontendGeneration: frontendResult,
        generatedFiles
      };

    }


    // ── Repository ───────────────────────────────────────────────────────────
    //
    // Receives a completed generation result and passes it to the repository
    // integration layer (branch → commit → pull request).
    // Does NOT call git commands or GitHub APIs.

    case "repository_worker": {

      const result = integrateGenerationResult({
        projectId:        taskInput.projectId,
        task:             taskInput.task             || {},
        generationResult: taskInput.generationResult || {},
        repositoryUrl:    taskInput.repositoryUrl    || null
      });

      return { ...result, agent: "repository_worker" };

    }


    // ── Unknown worker ────────────────────────────────────────────────────────

    default: {
      console.error(`[AGENT ADAPTERS] Unknown worker type: ${workerType}`);
      return {
        success: false,
        error:   `Unknown worker type: ${workerType}`
      };
    }

  }

}
