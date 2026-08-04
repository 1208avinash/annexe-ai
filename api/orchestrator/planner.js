// ── ANNEXE AI — Workflow Planner ─────────────────────────────────────────────
//
// Converts project requirements into a deterministic workflow plan.
// Templates are selected by project type; no AI or external calls are made.
//
// Phase 4: replace template selection with LLM-assisted semantic planning.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Phase templates ───────────────────────────────────────────────────────────
//
// Each template defines an ordered sequence of phases.
// `agent` maps to the registered worker/agent key in the execution layer.

const TEMPLATES = {

  // ── Default full-stack AI product ─────────────────────────────────────────
  default: [
    { name: "Architecture",  agent: "architect_agent"   },
    { name: "Backend",       agent: "backend_worker"    },
    { name: "Frontend",      agent: "frontend_worker"   },
    { name: "Execution",     agent: "execution_worker"  },
    { name: "Testing",       agent: "testing_worker"    },
    { name: "Review",        agent: "review_worker"     }
  ],

  // ── CRM / sales platform ──────────────────────────────────────────────────
  crm: [
    { name: "Architecture",  agent: "architect_agent"   },
    { name: "Backend",       agent: "backend_worker"    },
    { name: "CRM Module",    agent: "crm_worker"        },
    { name: "Frontend",      agent: "frontend_worker"   },
    { name: "Execution",     agent: "execution_worker"  },
    { name: "Testing",       agent: "testing_worker"    },
    { name: "Review",        agent: "review_worker"     }
  ],

  // ── SaaS / multi-tenant platform ──────────────────────────────────────────
  saas: [
    { name: "Architecture",  agent: "architect_agent"   },
    { name: "Auth Layer",    agent: "auth_worker"       },
    { name: "Backend",       agent: "backend_worker"    },
    { name: "Frontend",      agent: "frontend_worker"   },
    { name: "Billing",       agent: "billing_worker"    },
    { name: "Execution",     agent: "execution_worker"  },
    { name: "Testing",       agent: "testing_worker"    },
    { name: "Review",        agent: "review_worker"     }
  ],

  // ── Automation / workflow product ─────────────────────────────────────────
  automation: [
    { name: "Architecture",  agent: "architect_agent"   },
    { name: "Backend",       agent: "backend_worker"    },
    { name: "Automation Engine", agent: "automation_worker" },
    { name: "Frontend",      agent: "frontend_worker"   },
    { name: "Execution",     agent: "execution_worker"  },
    { name: "Testing",       agent: "testing_worker"    },
    { name: "Review",        agent: "review_worker"     }
  ],

  // ── AI-native product ─────────────────────────────────────────────────────
  ai: [
    { name: "Architecture",  agent: "architect_agent"   },
    { name: "AI Layer",      agent: "ai_worker"         },
    { name: "Backend",       agent: "backend_worker"    },
    { name: "Frontend",      agent: "frontend_worker"   },
    { name: "Execution",     agent: "execution_worker"  },
    { name: "Testing",       agent: "testing_worker"    },
    { name: "Review",        agent: "review_worker"     }
  ]

};


// ── Project type detection signals ────────────────────────────────────────────

const TYPE_SIGNALS = {
  crm:        ["crm", "lead", "pipeline", "sales", "contact"],
  saas:       ["saas", "subscription", "multi-tenant", "billing", "portal"],
  automation: ["automate", "workflow", "trigger", "integration", "bot"],
  ai:         ["ai", "agent", "llm", "chatbot", "intelligence", "gpt"]
};

function detectProjectType(project = {}) {

  const text = [
    project.name        || "",
    project.description || "",
    ...(project.requirements || [])
  ].join(" ").toLowerCase();

  for (const [type, signals] of Object.entries(TYPE_SIGNALS)) {
    if (signals.some(s => text.includes(s))) return type;
  }

  return "default";

}


// ── WorkflowPlanner class ─────────────────────────────────────────────────────

export class WorkflowPlanner {


  // ── selectTemplate ──────────────────────────────────────────────────────────
  //
  // Return the phase list for a given project type key.
  //
  // @param  {string}   projectType - e.g. "crm" | "saas" | "ai" | "default"
  // @returns {object[]}            - Ordered array of phase definitions

  selectTemplate(projectType) {

    return TEMPLATES[projectType] || TEMPLATES.default;

  }


  // ── createWorkflowPlan ──────────────────────────────────────────────────────
  //
  // Convert a project descriptor into a structured workflow plan.
  //
  // @param {object} project
  // @param {string} [project.name]           - Human-readable project name
  // @param {string} [project.description]    - Optional project description
  // @param {string[]} [project.requirements] - Requirement strings for type detection
  //
  // @returns {object} Workflow plan with phases and derived task list

  createWorkflowPlan(project = {}, forcedType = null) {

    const projectType = forcedType || detectProjectType(project);

const phases = [

    {
        name: "Requirement Intelligence",
        agent: "requirement_intelligence_agent"
    },

    ...this.selectTemplate(projectType)

];
    // ── Derive a flat task list from phases ───────────────────────────────
    // Each task gets a stable ID based on position and agent name.

    const tasks = phases.map((phase, index) => ({
      id:        `TASK-${String(index + 1).padStart(3, "0")}-${phase.agent.toUpperCase().replace(/_/g, "-")}`,
      name:      phase.name,
      agent:     phase.agent,
      status:    "pending",
      phase:     index + 1,
      createdAt: new Date().toISOString()
    }));

    return {
      projectType,
      name:      project.name || "ANNEXE Project",
      phases,
      tasks
    };

  }

}
