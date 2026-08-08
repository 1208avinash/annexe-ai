// ────────────────────────────────────────────────────────────────
// ANNEXE AI — Autonomous Decision Engine
//
// Phase 9.1
//
// Responsible for deciding:
// - project type
// - complexity
// - workflow strategy
// - approval requirement
//
// Does NOT execute agents.
// Does NOT modify workflow state.
//
// Uses WorkflowPlanner for actual workflow creation.
// ────────────────────────────────────────────────────────────────


import { WorkflowPlanner } from "./planner.js";


// ────────────────────────────────────────────────────────────────
// Decision Engine
// ────────────────────────────────────────────────────────────────

export class DecisionEngine {


  constructor() {

    this.planner = new WorkflowPlanner();

  }



  // ──────────────────────────────────────────────────────────────
  // analyze()
  //
  // Returns autonomous planning decision.
  //
  // @param {object} project
  // @returns {object}
  // ──────────────────────────────────────────────────────────────

  analyze(project = {}) {


    const text = [

      project.name || "",
      project.description || "",
      ...(project.requirements || [])

    ]
      .join(" ")
      .toLowerCase();



    const projectType =
      this.detectProjectType(project);



    const complexity =
      this.detectComplexity(text);



    const decision = {

      success: true,

      projectType,

      complexity,

      workflowStrategy: projectType,

      approvalRequired:
        complexity === "HIGH",

      executionMode:
        complexity === "HIGH"
          ? "sequential"
          : complexity === "MEDIUM"
            ? "mixed"
            : "parallel"

    };



    const plan =
      this.planner.createWorkflowPlan(project, projectType);



    return {

      ...decision,

      plan

    };


  }



  // ──────────────────────────────────────────────────────────────
  // Project type detection
  // ──────────────────────────────────────────────────────────────

  detectProjectType(project = {}) {

    const text = [

      project.name || "",
      project.description || "",
      ...(project.requirements || [])

    ]
      .join(" ")
      .toLowerCase();


    if (
      text.includes("saas") ||
      text.includes("multi tenant") ||
      text.includes("billing") ||
      text.includes("subscription")
    ) {

      return "saas";

    }


    if (
      text.includes("crm") ||
      text.includes("sales") ||
      text.includes("lead")
    ) {

      return "crm";

    }


    if (
      text.includes("automation") ||
      text.includes("workflow") ||
      text.includes("bot")
    ) {

      return "automation";

    }


    if (
      text.includes("ai") ||
      text.includes("agent") ||
      text.includes("llm")
    ) {

      return "ai";

    }


    return "default";

  }



  // ──────────────────────────────────────────────────────────────
  // Complexity detection
  // ──────────────────────────────────────────────────────────────

  detectComplexity(text = "") {


    const highSignals = [

      "saas",
      "multi tenant",
      "billing",
      "subscription",
      "marketplace",
      "enterprise",
      "trading"

    ];


    const mediumSignals = [

      "crm",
      "dashboard",
      "portal",
      "automation",
      "workflow"

    ];



    if (
      highSignals.some(signal => text.includes(signal))
    ) {

      return "HIGH";

    }



    if (
      mediumSignals.some(signal => text.includes(signal))
    ) {

      return "MEDIUM";

    }



    return "LOW";

  }


}