import fs from "fs/promises";
import path from "path";

const root = path.resolve("D:/annex-web");
const apiRoot = path.join(root, "api");
const libRoot = path.join(root, "lib");
const routeDispatcherFile = path.join(libRoot, "api-route-dispatcher.js");
const routeMapFile = path.join(libRoot, "api-route-map.js");
const catchAllFile = path.join(apiRoot, "[...route].js");

const keepApiFiles = new Set([
  "chat.js"
]);

const excludeDirNames = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage"
]);

const sourceExtensions = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx"]);

function toPosix(input) {
  return input.split(path.sep).join("/");
}

function isSourceFile(filePath) {
  return sourceExtensions.has(path.extname(filePath));
}

async function walk(dir, { includeDirs = false } = {}) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (excludeDirNames.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (includeDirs) {
        results.push(fullPath);
      }
      results.push(...await walk(fullPath, { includeDirs }));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

async function moveApiTree() {
  await fs.mkdir(libRoot, { recursive: true });

  const topLevel = await fs.readdir(apiRoot, { withFileTypes: true });
  for (const entry of topLevel) {
    if (keepApiFiles.has(entry.name)) {
      continue;
    }

    const from = path.join(apiRoot, entry.name);
    const to = path.join(libRoot, entry.name);
    if (entry.isDirectory()) {
      await fs.cp(from, to, { recursive: true, force: true, errorOnExist: false });
      await fs.rm(from, { recursive: true, force: true });
    } else {
      await fs.copyFile(from, to);
      await fs.rm(from, { force: true });
    }
  }
}

function isRouteHandler(filePath, source) {
  const base = path.basename(filePath);
  if (base === "chat.js" || base === "[...route].js") {
    return false;
  }

  if (/\b(before-|backup|test-)/i.test(base)) {
    return false;
  }

  return /export\s+default\s+(?:async\s+)?function\s+handler\s*\(/.test(source);
}

function routePathFromFile(filePath) {
  const rel = toPosix(path.relative(libRoot, filePath));
  if (rel.endsWith("/index.js")) {
    return "/" + rel.slice(0, -"/index.js".length);
  }

  const withoutExt = rel.replace(/\.js$/, "");
  return "/" + withoutExt;
}

function routeImportPath(filePath) {
  return "./" + toPosix(path.relative(libRoot, filePath));
}

async function generateRouteMap() {
  const files = await walk(libRoot);
  const routeFiles = [];

  for (const file of files) {
    if (!file.endsWith(".js")) continue;
    if (file === routeDispatcherFile || file === routeMapFile) continue;

    const source = await fs.readFile(file, "utf8");
    if (isRouteHandler(file, source)) {
      routeFiles.push(file);
    }
  }

  routeFiles.sort((a, b) => routePathFromFile(a).localeCompare(routePathFromFile(b)));

  const imports = [];
  const handlers = [];

  routeFiles.forEach((file, index) => {
    const name = `routeHandler${index}`;
    imports.push(`import ${name} from ${JSON.stringify(routeImportPath(file))};`);
    handlers.push(`  ${JSON.stringify(routePathFromFile(file))}: ${name}`);
  });

  const routeMapSource = `/* eslint-disable */\n${imports.join("\n")}\n\nexport const routeHandlers = {\n${handlers.join(",\n")}\n};\n`;
  await fs.writeFile(routeMapFile, routeMapSource, "utf8");

  const dispatcherSource = `import { routeHandlers } from "./api-route-map.js";\n\nfunction normalizeApiPath(req) {\n  const url = new URL(req.url || "/", "http://localhost");\n  return url.pathname.replace(/^\\/api/, "") || "/";\n}\n\nexport async function dispatchApiRoute(req, res) {\n  const route = normalizeApiPath(req).replace(/\\/$/, "") || "/";\n  const handler = routeHandlers[route];\n\n  if (!handler) {\n    return res.status(404).json({ error: "Not found" });\n  }\n\n  return handler(req, res);\n}\n\nexport default dispatchApiRoute;\n`;
  await fs.writeFile(routeDispatcherFile, dispatcherSource, "utf8");
}

async function createCatchAllEntry() {
  const source = `import dispatchApiRoute from "../lib/api-route-dispatcher.js";\n\nexport default async function handler(req, res) {\n  return dispatchApiRoute(req, res);\n}\n`;
  await fs.writeFile(catchAllFile, source, "utf8");
}

async function rewriteModulePaths() {
  const files = await walk(root);
  const targets = files.filter((file) =>
    isSourceFile(file) &&
    !toPosix(file).includes("/node_modules/") &&
    !toPosix(file).includes("/.git/") &&
    !toPosix(file).includes("/lib/") &&
    !toPosix(file).includes("/workspace/") &&
    !toPosix(file).endsWith("/api/[...route].js")
  );

  for (const file of targets) {
    let text = await fs.readFile(file, "utf8");
    const updated = text
      .replace(/(from\s+["'])(\.{1,2}\/)api\//g, "$1$2lib/")
      .replace(/(require\(\s*["'])(\.{1,2}\/)api\//g, "$1$2lib/")
      .replace(/(import\(\s*["'])(\.{1,2}\/)api\//g, "$1$2lib/");

    if (updated !== text) {
      await fs.writeFile(file, updated, "utf8");
    }
  }
}

async function main() {
  await moveApiTree();
  await generateRouteMap();
  await createCatchAllEntry();
  await rewriteModulePaths();
}

await main();
