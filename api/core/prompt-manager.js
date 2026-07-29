import { architecturePrompt } from "../prompts/architecture.js";
import { backendPrompt } from "../prompts/backend.js";
import { frontendPrompt } from "../prompts/frontend.js";
import { testingPrompt } from "../prompts/testing.js";
import { reviewPrompt } from "../prompts/review.js";


const PROMPTS = {
  architecture: architecturePrompt,
  backend: backendPrompt,
  frontend: frontendPrompt,
  testing: testingPrompt,
  review: reviewPrompt
};


export function getPrompt(name) {

  const prompt = PROMPTS[name];

  if (!prompt) {
    return {
      success: false,
      error: `Prompt not found: ${name}`
    };
  }

  return {
    success: true,
    ...prompt
  };
}


export function getAvailablePrompts() {
  return Object.keys(PROMPTS);
}
