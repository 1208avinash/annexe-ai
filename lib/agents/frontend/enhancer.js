// ── ANNEXE AI — Frontend Enhancer Agent ──────────────────────────────────────
//
// Input:  { frontendPlan, backendPlan, architecture, requirements }
// Output: { success, agent, enhancements: { uiArchitecture, apiIntegration,
//           performance, security, ux } }
//
// Mock mode activates automatically when core modules are unavailable.
// ─────────────────────────────────────────────────────────────────────────────

let buildPrompt, getModel, callAI;

try {
  ({ buildPrompt } = await import("../../core/prompt-manager.js"));
  ({ getModel }    = await import("../../core/model-router.js"));
  ({ callAI }      = await import("../../core/ai-client.js"));
} catch {
  buildPrompt = null;
  getModel    = null;
  callAI      = null;
}


// ── Mock enhancements ─────────────────────────────────────────────────────────

function buildMockEnhancements({ frontendPlan, backendPlan, architecture, requirements }) {

  const framework       = frontendPlan?.framework || architecture?.frontend?.framework || "Next.js";
  const features        = requirements?.features  || [];
  const backendFramework = backendPlan?.framework || architecture?.backend?.framework  || "FastAPI";

  const uiArchitecture = {
    componentStrategy: "Atomic design — atoms, molecules, organisms, templates, pages",
    stateManagement:   "React Context for global state; local useState for component state",
    routingStrategy:   framework === "Next.js"
      ? "App Router with nested layouts; dynamic routes for entity pages"
      : "React Router v6 with lazy-loaded route bundles",
    designSystem: {
      tokenLibrary:     "CSS custom properties for color, spacing, typography scales",
      componentLibrary: "Shared UI kit with documented props and Storybook stories",
      responsiveness:   "Mobile-first breakpoints: 375px → 768px → 1024px → 1440px"
    },
    codeOrganisation: [
      "Feature-based folder structure (not layer-based)",
      "Barrel exports per feature module",
      "Co-located tests, styles, and types",
      "Strict import boundaries between features"
    ],
    recommendations: [
      `Adopt ${framework} server components for data-heavy pages to reduce client bundle`,
      "Implement Suspense boundaries with meaningful skeleton UIs",
      "Use React.memo and useMemo strategically — profile before optimising",
      "Establish a theming contract (light / dark / brand) before component build"
    ]
  };

  const apiIntegration = {
    clientLayer: {
      approach:    "Centralised API client with typed request/response contracts",
      library:     "Native fetch with a thin wrapper; React Query for server state",
      errorPolicy: "Standardised error envelopes; retry with exponential back-off on 5xx"
    },
    patterns: [
      "Optimistic UI updates for mutation-heavy flows (forms, toggles, drag-drop)",
      "Cache-first reads with stale-while-revalidate for list endpoints",
      "Request deduplication for concurrent identical calls",
      "Abort controller to cancel in-flight requests on unmount"
    ],
    realTime: features.includes("chat / messaging")
      ? "WebSocket connection managed in a shared context; reconnect on drop"
      : "Polling fallback for live-update requirements where WebSocket is unavailable",
    authentication: {
      tokenStorage: "HttpOnly cookie (preferred) or in-memory — never localStorage",
      refreshFlow:  "Silent token refresh via interceptor before expiry",
      routeGuards:  "Higher-order component wrapping protected routes; redirect on 401"
    },
    backendContract: `Typed SDK generated from ${backendFramework} OpenAPI schema — keeps frontend and backend in sync automatically`
  };

  const performance = {
    bundleStrategy: {
      codeSplitting:     "Route-level splits; heavy third-party libs in separate chunks",
      treeshaking:       "ES module imports only; audit bundle with rollup-plugin-visualizer",
      assetOptimisation: "Images via next/image or equivalent; WebP with fallback; lazy load below fold"
    },
    renderingStrategy: framework === "Next.js"
      ? "Static pages (SSG) for marketing; ISR for catalogue; SSR for user-specific data; CSR for dashboards"
      : "CSR with skeleton loading; preload critical data on route entry",
    coreWebVitals: {
      LCP: "Preload hero image; server-render above-the-fold content",
      CLS: "Reserve space for async content; avoid injecting layout-shifting elements",
      INP: "Debounce expensive event handlers; keep main thread tasks < 50 ms"
    },
    caching: [
      "Service worker for offline shell caching (PWA-ready)",
      "HTTP cache headers aligned with API contract",
      "Memoised selectors for computed derived state"
    ],
    targets: {
      LCP:        "< 2.5 s on 4G",
      CLS:        "< 0.1",
      INP:        "< 200 ms",
      bundleSize: "< 200 kB initial JS (gzipped)"
    }
  };

  const security = {
    xss: {
      approach:     "React's default JSX escaping; dangerouslySetInnerHTML banned in lint rules",
      sanitisation: "DOMPurify for any user-generated HTML that must render"
    },
    csrf: {
      approach: "SameSite=Strict cookies; CSRF token header on state-mutating requests"
    },
    contentSecurityPolicy: {
      headers:    "Strict CSP via HTTP headers — not meta tags",
      nonce:      "Per-request nonce for inline scripts where unavoidable",
      directives: ["default-src 'self'", "script-src 'self' 'nonce-{n}'", "style-src 'self' 'unsafe-inline'"]
    },
    dependencyHygiene: [
      "Automated Dependabot / Renovate PRs for dependency updates",
      "npm audit in CI pipeline — block on high-severity findings",
      "Lock file committed and verified in CI"
    ],
    sensitiveData: [
      "No secrets or tokens in client-side code or environment variables exposed to browser",
      "PII masked in logging and error tracking",
      "Feature flags control access to sensitive UI sections"
    ]
  };

  const ux = {
    loadingStates: {
      strategy:   "Skeleton screens over spinners for layout-heavy pages",
      hierarchy:  "Global loading indicator for navigation; local skeletons for data regions",
      optimistic: "Instant UI feedback on user actions before server confirmation"
    },
    errorHandling: {
      strategy:     "Error boundaries per major UI region — one failure doesn't crash the app",
      userMessages: "Plain-language error copy; always offer a recovery action",
      emptyStates:  "Contextual empty-state illustrations with primary CTA"
    },
    accessibility: {
      standard:       "WCAG 2.1 AA minimum",
      keyboard:       "Full keyboard navigation; visible focus indicators",
      screenReader:   "Semantic HTML; ARIA labels on interactive elements; live regions for dynamic updates",
      colourContrast: "4.5:1 minimum for body text; 3:1 for large text and UI components"
    },
    microInteractions: [
      "Subtle transitions (150–250 ms ease-out) on state changes",
      "Haptic-ready touch targets (min 44 × 44 px)",
      "Toasts for async operation outcomes — auto-dismiss after 4 s",
      "Animated counters and progress indicators for long operations"
    ],
    formExperience: features.includes("authentication") || features.includes("payments")
      ? [
          "Inline validation on blur — not on every keystroke",
          "Password strength meter with clear criteria",
          "Auto-focus first field; Enter submits form",
          "Sticky submit CTA on mobile for long forms"
        ]
      : [
          "Progressive disclosure — show fields as they become relevant",
          "Smart defaults and autofill support",
          "Clear field labels — placeholders never replace labels"
        ],
    internationalisation: [
      "i18n-ready string extraction from day one",
      "RTL layout support via CSS logical properties",
      "Locale-aware date, number, and currency formatting"
    ]
  };

  return { uiArchitecture, apiIntegration, performance, security, ux };

}


// ── Prompt builder ────────────────────────────────────────────────────────────

function buildEnhancerPrompt({ frontendPlan, backendPlan, architecture, requirements }) {
  return `You are ANNEXE AI Frontend Enhancement Agent.

Analyse the following frontend plan and return a structured enhancement report
covering exactly these five categories:
uiArchitecture, apiIntegration, performance, security, ux.

FRONTEND PLAN:
${JSON.stringify(frontendPlan  || {}, null, 2)}

BACKEND PLAN:
${JSON.stringify(backendPlan   || {}, null, 2)}

ARCHITECTURE:
${JSON.stringify(architecture  || {}, null, 2)}

REQUIREMENTS:
${JSON.stringify(requirements  || {}, null, 2)}

Respond ONLY with a valid JSON object matching this exact shape — no preamble,
no markdown fences, no trailing text:

{
  "uiArchitecture": { ... },
  "apiIntegration":  { ... },
  "performance":     { ... },
  "security":        { ... },
  "ux":              { ... }
}

Each category must contain concrete, actionable recommendations specific to
the plan above. Never invent metrics or guarantee outcomes.`;
}


// ── Main exported agent function ──────────────────────────────────────────────

/**
 * runFrontendEnhancer
 *
 * @param {object} [input.frontendPlan]  - Frontend development plan
 * @param {object} [input.backendPlan]   - Backend plan for API contract context
 * @param {object} [input.architecture]  - Full system architecture
 * @param {object} [input.requirements]  - Structured requirements object
 *
 * @returns {object} Enhancement output with 5 quality categories
 */
export async function runFrontendEnhancer({
  frontendPlan  = null,
  backendPlan   = null,
  architecture  = null,
  requirements  = null
} = {}) {

  if (!frontendPlan && !architecture && !requirements) {
    return {
      success: false,
      agent:   "frontend_enhancer_agent",
      error:   "At least one of frontendPlan, architecture, or requirements is required"
    };
  }

  const input = { frontendPlan, backendPlan, architecture, requirements };

  // ── Attempt AI-powered enhancement ───────────────────────────────────────

  if (callAI && getModel) {

    try {

      const model      = getModel("enhancement");
      const prompt     = buildEnhancerPrompt(input);
      const aiResponse = await callAI({ model, prompt, maxTokens: 2000 });

      if (aiResponse) {

        const clean  = aiResponse.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        const requiredKeys = ["uiArchitecture", "apiIntegration", "performance", "security", "ux"];
        const hasAll       = requiredKeys.every(k => k in parsed);

        if (hasAll) {
          return {
            success:      true,
            agent:        "frontend_enhancer_agent",
            mode:         "ai",
            enhancements: parsed,
            _meta: { model, enhancedAt: new Date().toISOString() }
          };
        }

      }

    } catch (aiError) {
      console.warn("FRONTEND ENHANCER: AI call failed, falling back to mock:", aiError.message);
    }

  }

  // ── Mock mode fallback ────────────────────────────────────────────────────

  return {
    success:      true,
    agent:        "frontend_enhancer_agent",
    mode:         "mock",
    enhancements: buildMockEnhancements(input),
    _meta: { model: "mock", enhancedAt: new Date().toISOString() }
  };

}


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { frontendPlan, backendPlan, architecture, requirements } = req.body || {};

    if (!frontendPlan && !architecture && !requirements) {
      return res.status(400).json({
        error: "At least one of frontendPlan, architecture, or requirements is required"
      });
    }

    const result = await runFrontendEnhancer({ frontendPlan, backendPlan, architecture, requirements });

    return res.status(result.success ? 200 : 422).json(result);

  } catch (error) {

    console.error("FRONTEND ENHANCER AGENT ERROR:", error);
    return res.status(500).json({ error: "Frontend enhancement failed" });

  }

}