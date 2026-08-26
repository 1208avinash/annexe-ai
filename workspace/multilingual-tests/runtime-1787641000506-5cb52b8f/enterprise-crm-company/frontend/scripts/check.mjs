import fs from "fs";
import path from "path";

const required = [
  "package.json",
  "vite.config.js",
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/pages/Login.jsx",
  "src/pages/Dashboard.jsx",
  "src/pages/Customers.jsx",
  "src/pages/CustomerDetails.jsx",
  "src/services/api.js",
  "src/contexts/AuthContext.jsx",
  "src/components/LanguageSelector.jsx",
  "src/localization/index.js",
  "src/localization/resources.js"
];

for (const file of required) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

console.log("Frontend structure check passed.");
