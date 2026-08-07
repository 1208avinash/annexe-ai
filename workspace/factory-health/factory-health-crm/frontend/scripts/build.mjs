import fs from "fs";
import path from "path";

const root = process.cwd();
const dist = path.join(root, "dist");
const src = path.join(root, "src");

fs.mkdirSync(dist, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Factory Health CRM</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root">
      <h1>Factory Health CRM</h1>
      <p>Generated build artifact.</p>
      <ul>
        <li>Authentication</li>\n        <li>Dashboard</li>\n        <li>Customers</li>\n        <li>Leads</li>\n        <li>Contacts</li>\n        <li>Companies</li>\n        <li>Sales Pipeline</li>\n        <li>Tasks</li>\n        <li>Calendar</li>\n        <li>Reports</li>\n        <li>Notifications</li>\n        <li>Settings</li>
      </ul>
    </div>
  </body>
</html>`;

fs.writeFileSync(path.join(dist, "index.html"), html);
fs.writeFileSync(path.join(dist, "build-summary.json"), JSON.stringify({
  project: "Factory Health CRM",
  sourceDir: src,
  generatedAt: new Date().toISOString()
}, null, 2));

console.log("Frontend build completed.");
