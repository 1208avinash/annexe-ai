// ── ANNEXE AI — Product Vault (In-Memory Library) ────────────────────────────
//
// Temporary in-memory product registry.
// Phase 3: replace with Vercel KV / Postgres adapter.
//
// Every entry must be created via createProduct() to guarantee schema shape.
//
// ─────────────────────────────────────────────────────────────────────────────

import { createProduct } from "./schema.js";


export const PRODUCT_LIBRARY = [


  // ── Product 1: AI CRM Platform ─────────────────────────────────────────────

  createProduct({
    productId:   "PROD-001",
    name:        "ANNEXE AI CRM Platform",
    description: "Full-stack AI-powered CRM with lead management, pipeline tracking, and business intelligence.",
    category:    "crm",

    modules: [
      "authentication",
      "dashboard",
      "crm",
      "reports",
      "notifications",
      "api / integrations"
    ],

    features: [
      "authentication",
      "dashboard",
      "crm / contacts",
      "reporting",
      "notifications",
      "api / integrations",
      "chat / messaging"
    ],

    technology: {
      frontend:   "Next.js",
      backend:    "FastAPI",
      database:   "PostgreSQL",
      aiLayer:    "LLM API with agent orchestration layer",
      deployment: "Cloud deployment with CI/CD"
    },

    repository: "placeholder/annexe-crm",
    version:    "1.0.0",
    status:     "stable"
  }),


  // ── Product 2: AI Trading Platform ────────────────────────────────────────

  createProduct({
    productId:   "PROD-002",
    name:        "ANNEXE AI Trading Platform",
    description: "Algorithmic trading platform with real-time market data, automated execution, and portfolio analytics.",
    category:    "fintech",

    modules: [
      "authentication",
      "trading-engine",
      "dashboard",
      "analytics",
      "notifications",
      "api / integrations"
    ],

    features: [
      "authentication",
      "dashboard",
      "reporting",
      "notifications",
      "api / integrations",
      "payments",
      "file management"
    ],

    technology: {
      frontend:   "Next.js",
      backend:    "FastAPI",
      database:   "PostgreSQL",
      aiLayer:    "LLM API with agent orchestration layer",
      deployment: "Cloud deployment with CI/CD"
    },

    repository: "placeholder/annexe-trading",
    version:    "1.0.0",
    status:     "development"
  })


];
