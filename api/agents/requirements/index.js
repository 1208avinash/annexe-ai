// ── Requirement Agent ─────────────────────────────────────────────────────────
//
// Converts client conversation and context into structured software requirements.
// Designed to be stateless and modular — ready for LLM integration in Phase 3.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Keyword maps for classification ──────────────────────────────────────────

const PROJECT_TYPE_SIGNALS = {
  saas:        ["saas", "subscription", "multi-tenant", "platform", "portal"],
  mobile:      ["mobile", "app", "ios", "android", "flutter"],
  ecommerce:   ["shop", "store", "ecommerce", "cart", "checkout", "product"],
  crm:         ["crm", "leads", "pipeline", "sales", "contacts"],
  automation:  ["automate", "workflow", "trigger", "zap", "integration", "bot"],
  dashboard:   ["dashboard", "analytics", "reporting", "metrics", "kpi"],
  api:         ["api", "microservice", "backend", "endpoint", "webhook"],
  ai:          ["ai", "agent", "llm", "chatbot", "intelligence", "gpt"]
};

const PRIORITY_SIGNALS = {
  high:   ["urgent", "asap", "immediately", "critical", "launch", "soon", "deadline"],
  medium: ["next quarter", "planning", "roadmap", "upcoming"],
  low:    ["eventually", "future", "someday", "later", "nice to have"]
};

const CONSTRAINT_SIGNALS = {
  budget:   ["budget", "cost", "affordable", "cheap", "expensive", "price"],
  timeline: ["weeks", "months", "days", "deadline", "by", "before"],
  team:     ["solo", "small team", "no developer", "non-technical", "freelancer"],
  tech:     ["must use", "already have", "existing", "legacy", "no code"]
};


// ── Helpers ───────────────────────────────────────────────────────────────────

function normalise(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}

function detectProjectType(text) {
  const norm = normalise(text);
  for (const [type, signals] of Object.entries(PROJECT_TYPE_SIGNALS)) {
    if (signals.some(s => norm.includes(s))) return type;
  }
  return "custom";
}

function detectPriority(text) {
  const norm = normalise(text);
  for (const [level, signals] of Object.entries(PRIORITY_SIGNALS)) {
    if (signals.some(s => norm.includes(s))) return level;
  }
  return "medium";
}

function detectConstraints(text) {
  const norm   = normalise(text);
  const found  = [];
  for (const [type, signals] of Object.entries(CONSTRAINT_SIGNALS)) {
    if (signals.some(s => norm.includes(s))) found.push(type);
  }
  return found;
}

function extractUsers(text) {
  const norm    = normalise(text);
  const matches = [];
  const patterns = [
    ["admin",    ["admin", "administrator", "manager", "owner"]],
    ["customer", ["customer", "client", "buyer", "end user", "visitor"]],
    ["staff",    ["staff", "employee", "team", "agent", "operator"]],
    ["partner",  ["partner", "vendor", "supplier", "affiliate"]],
    ["api",      ["api consumer", "developer", "third party", "integration"]]
  ];
  for (const [role, signals] of patterns) {
    if (signals.some(s => norm.includes(s))) matches.push(role);
  }
  return matches.length ? matches : ["end user"];
}

function extractFeatures(text) {
  const norm     = normalise(text);
  const features = [];
  const featureMap = [
    ["authentication",     ["login", "auth", "register", "sign up", "password"]],
    ["dashboard",          ["dashboard", "overview", "home screen"]],
    ["notifications",      ["notification", "alert", "email", "sms", "push"]],
    ["payments",           ["payment", "billing", "invoice", "stripe", "subscription"]],
    ["reporting",          ["report", "analytics", "chart", "export", "metrics"]],
    ["chat / messaging",   ["chat", "message", "conversation", "inbox"]],
    ["file management",    ["upload", "file", "document", "attachment", "storage"]],
    ["crm / contacts",     ["contact", "lead", "pipeline", "deal"]],
    ["ai / automation",    ["ai", "automate", "agent", "bot", "intelligence"]],
    ["api / integrations", ["api", "integration", "webhook", "connect", "sync"]]
  ];
  for (const [feature, signals] of featureMap) {
    if (signals.some(s => norm.includes(s))) features.push(feature);
  }
  return features;
}

function scoreConfidence({ message, clientInfo }) {
  let score = 0;
  if (message && message.length > 50)  score += 30;
  if (message && message.length > 150) score += 20;
  if (clientInfo?.industry)            score += 15;
  if (clientInfo?.challenge)           score += 15;
  if (clientInfo?.companyName)         score += 10;
  if (clientInfo?.role)                score += 10;
  return Math.min(score, 100);
}


// ── Main exported agent function ──────────────────────────────────────────────

/**
 * runRequirementAgent
 *
 * @param {object} input
 * @param {string} input.message        - Latest client message
 * @param {string} [input.conversation] - Full conversation text (optional)
 * @param {object} [input.clientInfo]   - Memory object from chat (optional)
 *
 * @returns {object} Structured requirement output
 */
export function runRequirementAgent({
  message      = "",
  conversation = "",
  clientInfo   = {}
} = {}) {

  const fullText = [
    message,
    conversation,
    clientInfo?.challenge || "",
    clientInfo?.industry  || ""
  ].join(" ");

  const projectType     = detectProjectType(fullText);
  const priority        = detectPriority(fullText);
  const constraints     = detectConstraints(fullText);
  const users           = extractUsers(fullText);
  const features        = extractFeatures(fullText);
  const confidenceScore = scoreConfidence({ message, clientInfo });

  return {
    success: true,
    agent:   "requirement_agent",
    version: "1.0.0",

    requirements: {
      // ── Core problem statement ────────────────────────────────────────────
      problem: clientInfo?.challenge || message || "Not defined",

      // ── Business objective ────────────────────────────────────────────────
      businessGoal: clientInfo?.industry
        ? `Solve operational challenges in the ${clientInfo.industry} industry`
        : "Business goal not yet defined",

      // ── Detected user types ───────────────────────────────────────────────
      users,

      // ── Detected feature requirements ─────────────────────────────────────
      features,

      // ── Identified constraints ─────────────────────────────────────────────
      constraints,

      // ── Classified project type ───────────────────────────────────────────
      projectType,

      // ── Urgency level ─────────────────────────────────────────────────────
      priority,

      // ── Confidence in extracted data (0–100) ─────────────────────────────
      confidenceScore,

      // ── Raw client context preserved for LLM enrichment later ────────────
      _raw: {
        message,
        clientInfo,
        extractedAt: new Date().toISOString()
      }
    }
  };
}


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      message,
      conversation,
      clientInfo
    } = req.body || {};

    if (!message && !clientInfo) {
      return res.status(400).json({ error: "Message or clientInfo required" });
    }

    const result = runRequirementAgent({ message, conversation, clientInfo });

    return res.status(200).json(result);

  } catch (error) {

    console.error("REQUIREMENT AGENT ERROR:", error);

    return res.status(500).json({ error: "Requirement extraction failed" });

  }

}