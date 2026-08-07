import fs from "fs";
import path from "path";

const required = [
  "package.json",
  "vite.config.js",
  "index.html",
  "src/main.jsx",
  "src/App.jsx"
];

for (const file of required) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

console.log("Frontend structure check passed.");
