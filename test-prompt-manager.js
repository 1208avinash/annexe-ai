import {
  getPrompt,
  getAvailablePrompts
} from "./lib/core/prompt-manager.js";


console.log("\n════════════════════════════════");
console.log(" ANNEXE AI Prompt Manager Test");
console.log("════════════════════════════════\n");


console.log("Backend Prompt:");
console.log(getPrompt("backend"));


console.log("\nAvailable Prompts:");
console.log(getAvailablePrompts());


console.log("\nUnknown Prompt:");
console.log(getPrompt("unknown"));


console.log("\nPROMPT MANAGER TEST COMPLETE\n");
