import { createFrontendEngineeringPlan } from "../../engineering/frontend/schema.js";

// ── Framework detection ───────────────────────────────────────────────────────

const FRAMEWORK_SIGNALS = {
  "next":    "Next.js",
  "nextjs":  "Next.js",
  "next.js": "Next.js",
  "react":   "React",
  "vue":     "Vue",
  "nuxt":    "Nuxt.js",
  "angular": "Angular",
  "svelte":  "Svelte"
};

function detectFramework(technology = {}) {
  const raw = technology.frontend || "";
  const norm = raw.toLowerCase().trim();
  for (const [signal, canonical] of Object.entries(FRAMEWORK_SIGNALS)) {
    if (norm.includes(signal)) return canonical;
  }
  return raw || "React";
}


// ── Feature → page/component/task catalogue ───────────────────────────────────

const FEATURE_PAGES = {
  authentication: ["Login", "Register", "Forgot Password"],
  dashboard:      ["Dashboard"],
  crm:            ["CRM Customers", "Lead Management", "Contact Detail"],
  reporting:      ["Reports", "Analytics"],
  notifications:  ["Notifications"],
  chat:           ["Messaging", "Conversation Thread"],
  payments:       ["Billing", "Invoice"],
  file:           ["File Manager"],
  api:            ["API Settings"],
  ai:             ["AI Assistant", "Automation Hub"]
};

const FEATURE_COMPONENTS = {
  authentication: ["Login Form", "Register Form", "Auth Guard"],
  dashboard:      ["Dashboard Cards", "KPI Widgets", "Activity Feed"],
  crm:            ["Data Tables", "Lead Pipeline Board", "Contact Card", "CRM Forms"],
  reporting:      ["Charts", "Export Controls", "Date Range Picker"],
  notifications:  ["Notification Bell", "Alert Banner", "Toast Messages"],
  chat:           ["Chat Window", "Message Bubble", "Input Box"],
  payments:       ["Invoice Table", "Payment Form", "Billing Summary"],
  file:           ["File Upload", "File List", "Preview Modal"],
  api:            ["API Key Manager", "Webhook Config"],
  ai:             ["AI Chat Interface", "Automation Flow Builder"]
};

const FEATURE_UI_TASKS = {
  authentication: ["Implement form validation", "Handle auth error states", "Build protected route wrapper"],
  dashboard:      ["Build responsive dashboard grid", "Wire KPI cards to API", "Add loading skeletons"],
  crm:            ["Build sortable and filterable data table", "Implement drag-and-drop pipeline board", "Create CRM form with validation"],
  reporting:      ["Integrate charting library", "Implement CSV export", "Build date range filter"],
  notifications:  ["Build notification centre", "Implement real-time alert banners"],
  chat:           ["Build scrollable conversation thread", "Implement optimistic message send"],
  payments:       ["Build invoice list view", "Implement payment form with validation"],
  file:           ["Build drag-and-drop file uploader", "Implement file preview modal"],
  api:            ["Build API key display and copy UI"],
  ai:             ["Build AI chat interface", "Implement streaming response display"]
};

// Always-included baseline items regardless of features
const BASELINE_PAGES      = ["Home", "404 Not Found", "Settings"];
const BASELINE_COMPONENTS = ["Navigation", "Sidebar", "Page Layout", "Button", "Modal", "Loading Spinner"];
const BASELINE_UI_TASKS   = [
  "Create responsive layout system",
  "Build reusable component library",
  "Implement global error boundary",
  "Add accessibility attributes (ARIA)"
];


// ── State management ──────────────────────────────────────────────────────────

function buildStateManagement(features = []) {
  const state = ["Application loading state", "Global error state"];
  if (features.some(f => f.includes("auth")))         state.push("User authentication state", "Session management");
  if (features.some(f => f.includes("crm") || f.includes("dashboard"))) state.push("Application data state", "Pagination state");
  if (features.some(f => f.includes("notif")))        state.push("Notification queue state");
  if (features.some(f => f.includes("chat")))         state.push("Conversation history state");
  if (features.some(f => f.includes("ai") || f.includes("automat"))) state.push("AI response streaming state");
  return state;
}


// ── API integration ───────────────────────────────────────────────────────────

function buildApiIntegration(features = [], framework = "") {
  const items = [
    "Configure API base URL and environment variables",
    "Implement request interceptor for auth token injection",
    "Implement response interceptor for error handling",
    "Add request loading and error state management"
  ];
  if (features.some(f => f.includes("auth")))    items.push("Integrate authentication endpoints (login, register, refresh)");
  if (features.some(f => f.includes("crm")))     items.push("Integrate CRM CRUD endpoints");
  if (features.some(f => f.includes("report")))  items.push("Integrate analytics and reporting endpoints");
  if (features.some(f => f.includes("notif")))   items.push("Integrate notification polling or websocket");
  if (features.some(f => f.includes("ai") || f.includes("automat"))) items.push("Integrate AI streaming API endpoint");
  return items;
}


// ── Testing plan ──────────────────────────────────────────────────────────────

function buildTestingPlan(features = []) {
  const tests = [
    "Component unit tests for all reusable components",
    "Snapshot tests for static UI elements",
    "UI workflow tests for primary user journeys",
    "Responsive layout tests across breakpoints",
    "Accessibility audit (WCAG AA)"
  ];
  if (features.some(f => f.includes("auth")))  tests.push("Authentication flow end-to-end test");
  if (features.some(f => f.includes("crm")))   tests.push("CRM CRUD workflow end-to-end test");
  if (features.some(f => f.includes("pay")))   tests.push("Payment form validation test");
  if (features.some(f => f.includes("ai") || f.includes("automat"))) tests.push("AI interface streaming response test");
  return tests;
}


// ── Estimated tasks ───────────────────────────────────────────────────────────

function buildEstimatedTasks(pages = [], components = [], uiTasks = []) {
  return [
    { category: "Pages",      count: pages.length,      estimatedDaysEach: 1 },
    { category: "Components", count: components.length,  estimatedDaysEach: 0.5 },
    { category: "UI Tasks",   count: uiTasks.length,    estimatedDaysEach: 1 },
    { category: "Total estimated days", count: Math.ceil(pages.length * 1 + components.length * 0.5 + uiTasks.length * 1), estimatedDaysEach: null }
  ];
}


// ── Feature matcher ───────────────────────────────────────────────────────────

function matchFeature(feature, signalMap) {
  const norm = feature.toLowerCase();
  for (const [signal, items] of Object.entries(signalMap)) {
    if (norm.includes(signal) || signal.includes(norm.split(" ")[0])) {
      return items;
    }
  }
  return [];
}

function buildFromFeatures(features, pageMap, componentMap, taskMap) {
  const pages      = [...BASELINE_PAGES];
  const components = [...BASELINE_COMPONENTS];
  const uiTasks    = [...BASELINE_UI_TASKS];

  for (const feature of features) {
    matchFeature(feature, pageMap).forEach(p => { if (!pages.includes(p)) pages.push(p); });
    matchFeature(feature, componentMap).forEach(c => { if (!components.includes(c)) components.push(c); });
    matchFeature(feature, taskMap).forEach(t => { if (!uiTasks.includes(t)) uiTasks.push(t); });
  }

  return { pages, components, uiTasks };
}


// ── Main exported agent function ──────────────────────────────────────────────

export function runFrontendEngineerAgent({
  project          = {},
  technology       = {},
  requirements     = {},
  engineeringTasks = []
} = {}) {

  const projectId = project.projectId || null;
  const features  = requirements.features || [];
  const framework = detectFramework(technology);

  const { pages, components, uiTasks } = buildFromFeatures(
    features,
    FEATURE_PAGES,
    FEATURE_COMPONENTS,
    FEATURE_UI_TASKS
  );

  const stateManagement = buildStateManagement(features);
  const apiIntegration  = buildApiIntegration(features, framework);
  const testingPlan     = buildTestingPlan(features);
  const estimatedTasks  = buildEstimatedTasks(pages, components, uiTasks);

  const frontendPlan = createFrontendEngineeringPlan({
    projectId,
    framework,
    components,
    pages,
    uiTasks,
    stateManagement,
    apiIntegration,
    testingPlan,
    estimatedTasks
  });

  const totalDays = estimatedTasks.find(t => t.category === "Total estimated days")?.count || 0;

  return {
    success: true,
    agent:   "frontend_engineer_agent",
    version: "1.0.0",
    frontendPlan,
    _meta: {
      projectId,
      framework,
      featuresDetected:  features.length,
      pagesCount:        pages.length,
      componentsCount:   components.length,
      uiTasksCount:      uiTasks.length,
      estimatedTotalDays: totalDays,
      generatedAt:       new Date().toISOString()
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { project, technology, requirements, engineeringTasks } = req.body || {};
    if (!requirements) return res.status(400).json({ error: "requirements object required" });
    return res.status(200).json(runFrontendEngineerAgent({ project, technology, requirements, engineeringTasks }));
  } catch (error) {
    console.error("FRONTEND ENGINEER AGENT ERROR:", error);
    return res.status(500).json({ error: "Frontend engineering plan failed" });
  }
}