// ── ANNEXE AI — AI Client ─────────────────────────────────────────────────────
//
// Single communication layer between ANNEXE agents and OpenRouter API.
//
// Architecture:
//   Agent
//     ↓
//   Model Router   (selectModel — picks model by task type)
//     ↓
//   AI Client      (this file — handles auth, request, response)
//     ↓
//   OpenRouter API
//     ↓
//   Selected Model
//
// Usage:
//   import { generateAIResponse } from "../core/ai-client.js";
//
//   const result = await generateAIResponse({
//     task:        "coding",
//     complexity:  "medium",
//     messages:    [{ role: "user", content: "Write a FastAPI route." }],
//     temperature: 0.7
//   });
//
// ─────────────────────────────────────────────────────────────────────────────

import { selectModel } from "./model-router.js";


// ── Constants ─────────────────────────────────────────────────────────────────

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS  = 2000;


// ── generateAIResponse ────────────────────────────────────────────────────────
//
// Main entry point. Called by agent adapters when they need an AI completion.
//
// Parameters:
//   task        — "coding" | "architecture" | "testing" | "review" | "fast"
//   complexity  — "low" | "medium" | "high"  (passed to model router)
//   messages    — OpenAI-format messages array: [{ role, content }]
//   temperature — 0.0–1.0 (default 0.7)
//
// Returns:
//   { success: true,  model, provider, content }
//   { success: false, error }

export async function generateAIResponse({
  task        = "fast",
  complexity  = "medium",
  messages    = [],
  temperature = DEFAULT_TEMPERATURE
} = {}) {

  // ── 1. Guard: messages required ────────────────────────────────────────────

  if (!messages || messages.length === 0) {
    return {
      success: false,
      error:   "messages array is required and must not be empty"
    };
  }


  // ── 2. Select model via router ─────────────────────────────────────────────

  const { model, provider } = selectModel({ task, complexity });


  // ── 3. Guard: API key ──────────────────────────────────────────────────────
  //
  // Checked after model selection so the router is always exercised,
  // making it testable without a real key.

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error:   "OPENROUTER_API_KEY environment variable is not set"
    };
  }


  // ── 4. Safe log — never print the key ────────────────────────────────────

  console.log(
    `[AI CLIENT] Task: ${task} | Complexity: ${complexity} | Model: ${model} | Provider: ${provider}`
  );


  // ── 5. Call OpenRouter ────────────────────────────────────────────────────

  try {

    const response = await fetch(OPENROUTER_URL, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  process.env.APP_URL || "http://localhost:3000",
        "X-Title":       "ANNEXE AI"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: DEFAULT_MAX_TOKENS
      })
    });


    // ── 6. Parse response ──────────────────────────────────────────────────

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `HTTP ${response.status}`;
      console.error(`[AI CLIENT] Request failed: ${errMsg}`);
      return {
        success: false,
        error:   errMsg
      };
    }


    // ── 7. Extract content ─────────────────────────────────────────────────

    const content = data?.choices?.at(0)?.message?.content || null;

    if (!content) {
      return {
        success: false,
        error:   "Empty response from model"
      };
    }


    // ── 8. Return structured result ────────────────────────────────────────

    return {
      success:  true,
      model,
      provider,
      content
    };


  } catch (error) {

    console.error(`[AI CLIENT] Network error: ${error.message}`);

    return {
      success: false,
      error:   error.message || "Network error"
    };

  }

}
