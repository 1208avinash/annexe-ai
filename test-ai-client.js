// ── ANNEXE AI — AI Client Test ────────────────────────────────────────────────
//
// Tests ai-client.js without making real API calls.
//
// Strategy:
//   - Replace global fetch with a controlled mock before each test.
//   - Restore it after.
//   - Temporarily unset env vars to test missing-key handling.
//   - Capture console.log output to verify no API key is ever logged.
//
// Run from project root:
//   node test-ai-client.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { generateAIResponse } from "./api/core/ai-client.js";
import { selectModel }        from "./api/core/model-router.js";


// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual) {
  if (condition) {
    console.log(`✅  ${label}`);
    passed++;
  } else {
    console.log(`❌  ${label}  →  got: ${JSON.stringify(actual)}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 54 - title.length))}`);
}


// ── Mock helpers ──────────────────────────────────────────────────────────────

function mockFetch(responseBody, status = 200) {
  global.fetch = async () => ({
    ok:     status >= 200 && status < 300,
    status,
    json:   async () => responseBody
  });
}

function restoreFetch() {
  delete global.fetch;
}

// Capture console.log lines during a callback
async function captureLog(fn) {
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.join(" "));
  await fn();
  console.log = original;
  return lines;
}

const MESSAGES = [{ role: "user", content: "Write a FastAPI health check route." }];


// ── Test suite ────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log("  ANNEXE AI — AI Client Test");
console.log("══════════════════════════════════════════════════════════");


// 1. Import check ──────────────────────────────────────────────────────────────

section("1. Import");

assert("generateAIResponse is a function",
  typeof generateAIResponse === "function",
  typeof generateAIResponse
);

assert("selectModel is a function",
  typeof selectModel === "function",
  typeof selectModel
);


// 2. Model router integration ──────────────────────────────────────────────────

section("2. Model router — selectModel() returns expected shape");

const routerResult = selectModel({ task: "coding", complexity: "medium" });

assert("selectModel returns object",
  !!routerResult && typeof routerResult === "object",
  routerResult
);
assert("has task field",
  routerResult.task === "coding",
  routerResult.task
);
assert("has provider field",
  typeof routerResult.provider === "string" && routerResult.provider.length > 0,
  routerResult.provider
);
assert("has model field",
  typeof routerResult.model === "string" && routerResult.model.length > 0,
  routerResult.model
);


// 3. Missing API key ───────────────────────────────────────────────────────────

section("3. Missing API key — safe failure");

{
  const savedKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;

  mockFetch({ choices: [{ message: { content: "hello" } }] });

  const result = await generateAIResponse({
    task:     "coding",
    messages: MESSAGES
  });

  restoreFetch();
  if (savedKey !== undefined) process.env.OPENROUTER_API_KEY = savedKey;

  assert("returns success: false",
    result.success === false,
    result.success
  );
  assert("error mentions API key",
    typeof result.error === "string" &&
    result.error.toLowerCase().includes("openrouter_api_key"),
    result.error
  );
  assert("no content field on failure",
    result.content === undefined,
    result.content
  );
}


// 4. Empty messages guard ──────────────────────────────────────────────────────

section("4. Empty messages — safe failure");

{
  process.env.OPENROUTER_API_KEY = "test-key";

  const result = await generateAIResponse({
    task:     "coding",
    messages: []
  });

  assert("returns success: false",
    result.success === false,
    result.success
  );
  assert("error mentions messages",
    typeof result.error === "string" &&
    result.error.toLowerCase().includes("messages"),
    result.error
  );
}


// 5. Successful response ───────────────────────────────────────────────────────

section("5. Successful mock response");

{
  process.env.OPENROUTER_API_KEY = "test-key";

  mockFetch({
    choices: [{
      message: { content: "from fastapi import FastAPI\napp = FastAPI()" }
    }]
  }, 200);

  const result = await generateAIResponse({
    task:        "coding",
    complexity:  "medium",
    messages:    MESSAGES,
    temperature: 0.7
  });

  restoreFetch();

  assert("returns success: true",
    result.success === true,
    result.success
  );
  assert("has model field",
    typeof result.model === "string" && result.model.length > 0,
    result.model
  );
  assert("has provider field",
    typeof result.provider === "string" && result.provider.length > 0,
    result.provider
  );
  assert("has content field",
    typeof result.content === "string" && result.content.length > 0,
    result.content
  );
  assert("content matches mock",
    result.content.includes("FastAPI"),
    result.content
  );
}


// 6. HTTP error from provider ──────────────────────────────────────────────────

section("6. HTTP error from provider — safe failure");

{
  process.env.OPENROUTER_API_KEY = "test-key";

  mockFetch({ error: { message: "Rate limit exceeded" } }, 429);

  const result = await generateAIResponse({
    task:     "review",
    messages: MESSAGES
  });

  restoreFetch();

  assert("returns success: false",
    result.success === false,
    result.success
  );
  assert("error message present",
    typeof result.error === "string" && result.error.length > 0,
    result.error
  );
}


// 7. Empty content from model ──────────────────────────────────────────────────

section("7. Empty content from model — safe failure");

{
  process.env.OPENROUTER_API_KEY = "test-key";

  mockFetch({ choices: [{ message: { content: "" } }] }, 200);

  const result = await generateAIResponse({
    task:     "fast",
    messages: MESSAGES
  });

  restoreFetch();

  assert("returns success: false",
    result.success === false,
    result.success
  );
  assert("error mentions empty response",
    typeof result.error === "string" &&
    result.error.toLowerCase().includes("empty"),
    result.error
  );
}


// 8. Network error ─────────────────────────────────────────────────────────────

section("8. Network error — safe failure");

{
  process.env.OPENROUTER_API_KEY = "test-key";

  global.fetch = async () => { throw new Error("ECONNREFUSED"); };

  const result = await generateAIResponse({
    task:     "coding",
    messages: MESSAGES
  });

  restoreFetch();

  assert("returns success: false",
    result.success === false,
    result.success
  );
  assert("error message present",
    typeof result.error === "string" && result.error.length > 0,
    result.error
  );
}


// 9. API key never logged ──────────────────────────────────────────────────────

section("9. API key never appears in logs");

{
  const SECRET = "sk-or-v1-supersecretkey123";
  process.env.OPENROUTER_API_KEY = SECRET;

  mockFetch({
    choices: [{ message: { content: "Hello from model" } }]
  }, 200);

  const lines = await captureLog(async () => {
    await generateAIResponse({
      task:     "coding",
      messages: MESSAGES
    });
  });

  restoreFetch();

  const keyLeaked = lines.some(line => line.includes(SECRET));

  assert("API key never appears in any log line",
    !keyLeaked,
    keyLeaked ? "KEY FOUND IN LOGS" : "clean"
  );
}


// 10. Task routing — each task type selects correct category ───────────────────

section("10. Task routing — all task types");

{
  const tasks = ["architecture", "coding", "testing", "review", "fast"];

  for (const task of tasks) {
    const r = selectModel({ task, complexity: "medium" });
    assert(
      `task "${task}" resolves to a model string`,
      typeof r.model === "string" && r.model.length > 0,
      r.model
    );
    assert(
      `task "${task}" resolves to provider "openrouter"`,
      r.provider === "openrouter",
      r.provider
    );
  }
}


// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════");
console.log(`  ${failed === 0 ? "✅" : "❌"}  ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  AI CLIENT TEST PASSED");
} else {
  console.log("  SOME TESTS FAILED — check ai-client.js");
  process.exit(1);
}

console.log("══════════════════════════════════════════════════════════\n");
