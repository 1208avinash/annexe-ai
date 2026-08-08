// ── ANNEXE AI — Build Executor ────────────────────────────────────────────────
//
// Pure data layer — no shell execution, no file system access, no external
// calls.  Provides build-step definitions keyed by technology so the build
// worker can produce a deterministic build plan without running anything.
//
// Every function returns a plain object or array.  Nothing here has side
// effects.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Backend build steps by framework ─────────────────────────────────────────

const BACKEND_STEPS = {

  "FastAPI": [
    { order: 1, stage: "install",   command: "pip install -r requirements.txt", description: "Install Python dependencies" },
    { order: 2, stage: "lint",      command: "flake8 src/",                     description: "Lint Python source files" },
    { order: 3, stage: "test",      command: "pytest tests/",                   description: "Run backend test suite" },
    { order: 4, stage: "start",     command: "uvicorn main:app --host 0.0.0.0", description: "Start FastAPI server" }
  ],

  "Express": [
    { order: 1, stage: "install",   command: "npm install",                     description: "Install Node dependencies" },
    { order: 2, stage: "lint",      command: "npm run lint",                    description: "Lint source files" },
    { order: 3, stage: "test",      command: "npm test",                        description: "Run backend test suite" },
    { order: 4, stage: "start",     command: "node src/index.js",               description: "Start Express server" }
  ],

  "NestJS": [
    { order: 1, stage: "install",   command: "npm install",                     description: "Install Node dependencies" },
    { order: 2, stage: "build",     command: "npm run build",                   description: "Compile TypeScript" },
    { order: 3, stage: "test",      command: "npm test",                        description: "Run backend test suite" },
    { order: 4, stage: "start",     command: "node dist/main.js",               description: "Start NestJS server" }
  ],

  "default": [
    { order: 1, stage: "install",   command: "npm install",                     description: "Install dependencies" },
    { order: 2, stage: "build",     command: "npm run build",                   description: "Build project" },
    { order: 3, stage: "test",      command: "npm test",                        description: "Run test suite" },
    { order: 4, stage: "start",     command: "npm start",                       description: "Start server" }
  ]

};


// ── Frontend build steps by framework ────────────────────────────────────────

const FRONTEND_STEPS = {

  "Next.js": [
    { order: 1, stage: "install",   command: "npm install",                     description: "Install Node dependencies" },
    { order: 2, stage: "lint",      command: "npm run lint",                    description: "Lint frontend source" },
    { order: 3, stage: "build",     command: "npm run build",                   description: "Build Next.js production bundle" },
    { order: 4, stage: "start",     command: "npm run start",                   description: "Serve production build" }
  ],

  "React": [
    { order: 1, stage: "install",   command: "npm install",                     description: "Install Node dependencies" },
    { order: 2, stage: "lint",      command: "npm run lint",                    description: "Lint frontend source" },
    { order: 3, stage: "build",     command: "npm run build",                   description: "Build React production bundle" },
    { order: 4, stage: "start",     command: "npx serve build/",               description: "Serve production build" }
  ],

  "Vue": [
    { order: 1, stage: "install",   command: "npm install",                     description: "Install Node dependencies" },
    { order: 2, stage: "build",     command: "npm run build",                   description: "Build Vue production bundle" },
    { order: 3, stage: "start",     command: "npx serve dist/",                description: "Serve production build" }
  ],

  "default": [
    { order: 1, stage: "install",   command: "npm install",                     description: "Install dependencies" },
    { order: 2, stage: "build",     command: "npm run build",                   description: "Build project" },
    { order: 3, stage: "start",     command: "npm start",                       description: "Start application" }
  ]

};


// ── Database migration steps by engine ───────────────────────────────────────

const DATABASE_STEPS = {

  "PostgreSQL": [
    { order: 1, stage: "migrate",   command: "psql -f migrations/001_init.sql", description: "Run initial schema migration" },
    { order: 2, stage: "seed",      command: "psql -f seeds/001_seed.sql",      description: "Seed reference data" },
    { order: 3, stage: "verify",    command: "psql -c '\\dt'",                  description: "Verify tables created" }
  ],

  "MySQL": [
    { order: 1, stage: "migrate",   command: "mysql < migrations/001_init.sql", description: "Run initial schema migration" },
    { order: 2, stage: "seed",      command: "mysql < seeds/001_seed.sql",      description: "Seed reference data" }
  ],

  "MongoDB": [
    { order: 1, stage: "migrate",   command: "node scripts/migrate.js",         description: "Run schema migration script" },
    { order: 2, stage: "seed",      command: "node scripts/seed.js",            description: "Seed initial data" }
  ],

  "default": [
    { order: 1, stage: "migrate",   command: "npm run migrate",                 description: "Run database migrations" }
  ]

};


// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Return the backend build steps for a given framework name.
 * Falls back to "default" if the framework is not recognised.
 */
export function getBackendSteps(framework = "") {
  return BACKEND_STEPS[framework] || BACKEND_STEPS["default"];
}

/**
 * Return the frontend build steps for a given framework name.
 */
export function getFrontendSteps(framework = "") {
  return FRONTEND_STEPS[framework] || FRONTEND_STEPS["default"];
}

/**
 * Return the database migration steps for a given engine name.
 */
export function getDatabaseSteps(engine = "") {
  return DATABASE_STEPS[engine] || DATABASE_STEPS["default"];
}

/**
 * Classify a generated file into a build stage based on its path.
 * Returns one of: "backend" | "frontend" | "database" | "config" | "other"
 */
export function classifyFile(filePath = "") {
  const p = filePath.toLowerCase();

  if (p.includes("migration") || p.endsWith(".sql"))           return "database";
  if (p.includes("test") || p.includes("spec"))                return "test";
  if (p.endsWith(".py") || p.includes("src/api"))              return "backend";
  if (p.endsWith(".tsx") || p.endsWith(".jsx") ||
      p.includes("pages/") || p.includes("components/"))       return "frontend";
  if (p.endsWith(".json") || p.endsWith(".yaml") ||
      p.endsWith(".yml")  || p.endsWith(".env")  ||
      p.includes(".env.") || p.includes("config"))              return "config";

  return "other";
}
