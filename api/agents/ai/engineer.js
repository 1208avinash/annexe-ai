import { createAIEngineeringPlan } from "../../engineering/ai/schema.js";

// ── Feature catalogues ────────────────────────────────────────────────────────

const FEATURE_ARCHITECTURE = {
  assistant:   ["LLM assistant layer", "Conversational memory layer"],
  rag:         ["RAG knowledge retrieval layer", "Vector embedding layer", "Document ingestion pipeline"],
  lead:        ["AI lead qualification engine", "Lead scoring model layer"],
  automation:  ["AI workflow automation engine", "Trigger and action orchestration layer"],
  crm:         ["CRM intelligence layer", "Customer insight engine"],
  support:     ["AI customer support layer", "Ticket triage engine"],
  reporting:   ["AI analytics engine", "Natural language reporting layer"],
  chat:        ["AI chat interface layer", "Streaming response handler"],
  ai:          ["LLM assistant layer", "Agent orchestration layer", "Tool-call execution layer"]
};

const FEATURE_MODELS = {
  assistant:   ["Large Language Model (LLM) — primary reasoning"],
  rag:         ["Embedding model — vector generation", "Reranking model — retrieval quality"],
  lead:        ["Classification model — lead scoring"],
  automation:  ["Large Language Model — workflow decision engine"],
  chat:        ["Large Language Model — conversational response"],
  ai:          ["Large Language Model (LLM) — primary reasoning", "Embedding model — semantic search"]
};

const FEATURE_WORKFLOWS = {
  lead:        ["Lead intake and qualification workflow", "Lead scoring and routing workflow", "Lead follow-up automation workflow"],
  crm:         ["Customer onboarding AI workflow", "Customer health scoring workflow"],
  support:     ["Support ticket triage workflow", "Automated response generation workflow", "Escalation detection workflow"],
  automation:  ["Business trigger detection workflow", "AI decision and action execution workflow"],
  reporting:   ["Natural language query to report workflow"],
  assistant:   ["User intent detection workflow", "Contextual response generation workflow"],
  chat:        ["Conversation routing workflow", "Multi-turn context management workflow"],
  ai:          ["Agent task planning workflow", "Tool selection and execution workflow"]
};

const FEATURE_PROMPTS = {
  assistant:   ["System persona and role prompt", "Conversation context injection prompt"],
  lead:        ["Lead qualification criteria prompt", "Scoring rubric prompt"],
  support:     ["Support tone and escalation policy prompt", "Resolution suggestion prompt"],
  crm:         ["Customer insight generation prompt", "Relationship summary prompt"],
  automation:  ["Workflow decision reasoning prompt", "Action selection prompt"],
  ai:          ["Agent system prompt design", "Tool-call formatting prompt", "Safety and refusal boundary prompt"]
};

const FEATURE_INTEGRATIONS = {
  assistant:   ["LLM API client (OpenAI / Anthropic / OpenRouter)", "Streaming response handler"],
  rag:         ["Vector database integration (Pinecone / Weaviate / pgvector)", "Document loader and chunking pipeline"],
  lead:        ["CRM API integration for lead data ingestion"],
  automation:  ["Workflow trigger integration (webhooks / event bus)"],
  chat:        ["WebSocket integration for real-time streaming"],
  ai:          ["LLM API client with retry and rate-limit handling", "Tool registry integration"]
};

const FEATURE_DATA_PIPELINE = {
  rag:         ["Document ingestion and preprocessing", "Text chunking and embedding generation", "Vector store upsert and index management", "Retrieval pipeline with similarity threshold tuning"],
  lead:        ["Lead data normalisation pipeline", "Feature extraction for scoring model"],
  crm:         ["Customer data aggregation pipeline", "Insight generation batch pipeline"],
  reporting:   ["Data query pipeline for natural language reporting"],
  ai:          ["Conversation history ingestion pipeline", "Memory summarisation pipeline", "Context window management pipeline"]
};

const BASELINE_ARCHITECTURE = ["LLM API integration layer", "Agent orchestration core", "Prompt management system"];
const BASELINE_MODELS       = ["Large Language Model (LLM) — primary reasoning and generation"];
const BASELINE_WORKFLOWS    = ["User input processing workflow", "AI response generation and delivery workflow"];
const BASELINE_PROMPTS      = ["Base system prompt design", "Safety and boundary prompt", "Output formatting prompt"];
const BASELINE_INTEGRATIONS = ["LLM API client with retry, timeout, and rate-limit handling", "Environment-based model configuration"];
const BASELINE_DATA_PIPELINE = ["Input validation and sanitisation pipeline", "Response post-processing and formatting pipeline"];


// ── Evaluation plan ───────────────────────────────────────────────────────────

function buildEvaluationPlan(features = []) {
  const plan = [
    "Define response quality rubric (accuracy, relevance, tone)",
    "Build prompt regression test suite for core workflows",
    "Implement automated output scoring with LLM-as-judge pattern",
    "Establish hallucination detection baseline",
    "Track latency and token consumption per workflow",
    "Define acceptable P95 response time targets"
  ];

  if (features.some(f => f.includes("lead") || f.includes("scor"))) {
    plan.push("Evaluate lead scoring accuracy against human-labelled dataset");
  }
  if (features.some(f => f.includes("rag") || f.includes("knowledge"))) {
    plan.push("Measure retrieval precision and recall for RAG pipeline", "Evaluate chunk relevance with embedding similarity threshold");
  }
  if (features.some(f => f.includes("support"))) {
    plan.push("Measure customer support resolution rate and escalation accuracy");
  }
  if (features.some(f => f.includes("automat"))) {
    plan.push("Evaluate workflow decision correctness against predefined test cases");
  }

  return plan;
}


// ── Security plan ─────────────────────────────────────────────────────────────

function buildSecurityPlan(features = []) {
  const plan = [
    "Implement prompt injection detection and rejection layer",
    "Sanitise all user input before injection into prompts",
    "Never include raw PII or credentials in prompt context",
    "Implement output filtering for sensitive data leakage",
    "Rotate LLM API keys via secrets manager — never hardcode",
    "Log all AI interactions for audit and compliance review",
    "Implement token budget limits per user session to prevent abuse"
  ];

  if (features.some(f => f.includes("rag") || f.includes("knowledge"))) {
    plan.push("Restrict RAG knowledge base access by user role and tenant");
  }
  if (features.some(f => f.includes("automat"))) {
    plan.push("Require human confirmation for high-impact automated actions", "Implement action allowlist — AI may not trigger arbitrary system commands");
  }
  if (features.some(f => f.includes("support"))) {
    plan.push("Prevent AI from making commitments or promises not authorised by business policy");
  }

  return plan;
}


// ── Testing plan ──────────────────────────────────────────────────────────────

function buildTestingPlan(features = []) {
  const tests = [
    "Unit tests for all prompt builder functions",
    "Integration tests for LLM API client (with mock responses)",
    "Workflow end-to-end tests with deterministic mock LLM",
    "Regression test suite for all system prompts",
    "Token budget and rate-limit behaviour tests",
    "Fallback and error handling tests (API timeout, invalid response)"
  ];

  if (features.some(f => f.includes("rag") || f.includes("knowledge"))) {
    tests.push("RAG retrieval pipeline tests with known document corpus", "Embedding generation and vector storage integration tests");
  }
  if (features.some(f => f.includes("automat"))) {
    tests.push("Workflow decision accuracy tests against labelled scenarios");
  }
  if (features.some(f => f.includes("lead") || f.includes("scor"))) {
    tests.push("Lead scoring consistency tests across identical inputs");
  }
  if (features.some(f => f.includes("chat") || f.includes("assistant"))) {
    tests.push("Multi-turn conversation context retention tests");
  }

  return tests;
}


// ── Estimated tasks ───────────────────────────────────────────────────────────

function buildEstimatedTasks(architecture, models, workflows, prompts, integrations, dataPipeline, evaluationPlan, testingPlan) {
  const totalDays = Math.ceil(
    architecture.length  * 1   +
    models.length        * 0.5 +
    workflows.length     * 1.5 +
    prompts.length       * 0.5 +
    integrations.length  * 1   +
    dataPipeline.length  * 1   +
    evaluationPlan.length * 0.5 +
    testingPlan.length   * 0.5
  );

  return [
    { category: "Architecture Components", count: architecture.length,   estimatedDaysEach: 1   },
    { category: "Models",                  count: models.length,         estimatedDaysEach: 0.5 },
    { category: "Workflows",               count: workflows.length,      estimatedDaysEach: 1.5 },
    { category: "Prompt Templates",        count: prompts.length,        estimatedDaysEach: 0.5 },
    { category: "Integrations",            count: integrations.length,   estimatedDaysEach: 1   },
    { category: "Data Pipeline Steps",     count: dataPipeline.length,   estimatedDaysEach: 1   },
    { category: "Evaluation Tasks",        count: evaluationPlan.length, estimatedDaysEach: 0.5 },
    { category: "Test Suites",             count: testingPlan.length,    estimatedDaysEach: 0.5 },
    { category: "Total estimated days",    count: totalDays,             estimatedDaysEach: null }
  ];
}


// ── Feature matcher ───────────────────────────────────────────────────────────

function matchFeature(feature, signalMap) {
  const norm = feature.toLowerCase();
  for (const [signal, items] of Object.entries(signalMap)) {
    if (norm.includes(signal) || signal.includes(norm.split(" ")[0])) return items;
  }
  return [];
}

function buildFromFeatures(features) {
  const architecture = [...BASELINE_ARCHITECTURE];
  const models       = [...BASELINE_MODELS];
  const workflows    = [...BASELINE_WORKFLOWS];
  const prompts      = [...BASELINE_PROMPTS];
  const integrations = [...BASELINE_INTEGRATIONS];
  const dataPipeline = [...BASELINE_DATA_PIPELINE];

  for (const feature of features) {
    matchFeature(feature, FEATURE_ARCHITECTURE).forEach(a => { if (!architecture.includes(a)) architecture.push(a); });
    matchFeature(feature, FEATURE_MODELS).forEach(m => { if (!models.includes(m)) models.push(m); });
    matchFeature(feature, FEATURE_WORKFLOWS).forEach(w => { if (!workflows.includes(w)) workflows.push(w); });
    matchFeature(feature, FEATURE_PROMPTS).forEach(p => { if (!prompts.includes(p)) prompts.push(p); });
    matchFeature(feature, FEATURE_INTEGRATIONS).forEach(i => { if (!integrations.includes(i)) integrations.push(i); });
    matchFeature(feature, FEATURE_DATA_PIPELINE).forEach(d => { if (!dataPipeline.includes(d)) dataPipeline.push(d); });
  }

  return { architecture, models, workflows, prompts, integrations, dataPipeline };
}


// ── Main exported agent function ──────────────────────────────────────────────

export function runAIEngineerAgent({
  project          = {},
  technology       = {},
  requirements     = {},
  engineeringTasks = []
} = {}) {

  const projectId = project.projectId || null;
  const features  = requirements.features || [];

  const { architecture, models, workflows, prompts, integrations, dataPipeline } = buildFromFeatures(features);

  const evaluationPlan = buildEvaluationPlan(features);
  const securityPlan   = buildSecurityPlan(features);
  const testingPlan    = buildTestingPlan(features);
  const estimatedTasks = buildEstimatedTasks(
    architecture, models, workflows, prompts,
    integrations, dataPipeline, evaluationPlan, testingPlan
  );

  const aiPlan = createAIEngineeringPlan({
    projectId,
    aiArchitecture: architecture,
    models,
    workflows,
    prompts,
    integrations,
    dataPipeline,
    evaluationPlan,
    securityPlan,
    testingPlan,
    estimatedTasks
  });

  const totalDays = estimatedTasks.find(t => t.category === "Total estimated days")?.count || 0;

  return {
    success: true,
    agent:   "ai_engineer_agent",
    version: "1.0.0",
    aiPlan,
    _meta: {
      projectId,
      featuresDetected:       features.length,
      architectureCount:      architecture.length,
      modelsCount:            models.length,
      workflowsCount:         workflows.length,
      promptsCount:           prompts.length,
      integrationsCount:      integrations.length,
      dataPipelineCount:      dataPipeline.length,
      evaluationTasksCount:   evaluationPlan.length,
      securityTasksCount:     securityPlan.length,
      testingTasksCount:      testingPlan.length,
      estimatedTotalDays:     totalDays,
      generatedAt:            new Date().toISOString()
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { project, technology, requirements, engineeringTasks } = req.body || {};
    if (!requirements) return res.status(400).json({ error: "requirements object required" });
    return res.status(200).json(runAIEngineerAgent({ project, technology, requirements, engineeringTasks }));
  } catch (error) {
    console.error("AI ENGINEER AGENT ERROR:", error);
    return res.status(500).json({ error: "AI engineering plan failed" });
  }
}