import { runApplicationGeneration } from "./lib/generation/application-generator.js";

const result = await runApplicationGeneration({ type: "crm" });

if (!result.success) {
    process.exit(1);
}
