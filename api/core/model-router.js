// ANNEXE AI — Model Router
//
// Decides which AI model category should handle a task.
// Does NOT call AI providers.

const MODELS = {

  architecture: {
    provider: "openrouter",
    model: process.env.ARCHITECT_MODEL || "unset"
  },

  coding: {
    provider: "openrouter",
    model: process.env.CODING_MODEL || "unset"
  },

  testing: {
    provider: "openrouter",
    model: process.env.TESTING_MODEL || "unset"
  },

  review: {
    provider: "openrouter",
    model: process.env.REVIEW_MODEL || "unset"
  },

  fast: {
    provider: "openrouter",
    model: process.env.FAST_MODEL || "unset"
  }

};


export function selectModel({
  task = "fast",
  complexity = "medium"
} = {}) {

  let category = "fast";


  if (task === "architecture") {
    category = "architecture";
  }

  else if (task === "coding") {
    category = "coding";
  }

  else if (task === "testing") {
    category = "testing";
  }

  else if (task === "review") {
    category = "review";
  }


  return {
    task,
    complexity,
    ...MODELS[category]
  };

}


export function getAvailableModels() {
  return MODELS;
}