import {
    parseCliArgs,
    parseAnswersInput
} from "./api/generation/application-generator.js";
import { runCompanyOrchestration } from "./api/company/company-orchestrator.js";

const parsed = parseCliArgs();
const result = await runCompanyOrchestration({
    type: parsed.type,
    requestText: parsed.requestText,
    answers: parseAnswersInput(parsed),
    interactive: parsed.interactive
});

if (!result.success) {
    process.exit(1);
}

