import { runApplicationGeneration } from "./api/generation/application-generator.js";

const result = await runApplicationGeneration({ type: "crm" });

if (!result.success) {
    process.exit(1);
}
