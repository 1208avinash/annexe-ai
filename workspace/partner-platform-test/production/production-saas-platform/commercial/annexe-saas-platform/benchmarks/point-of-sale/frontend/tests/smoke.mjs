import fs from "fs";
import path from "path";

const required = [
  "dist/index.html",
  "dist/assets"
];

for (const item of required) {
  if (!fs.existsSync(path.join(process.cwd(), item))) {
    throw new Error(`Missing build artifact: ${item}`);
  }
}

console.log("Frontend smoke tests passed.");
