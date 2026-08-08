import {
    parseCliArgs,
    parseAnswersInput
} from "./lib/generation/application-generator.js";
import { runCommercialSaaSPlatform } from "./lib/platform/commercial-saas-platform.js";

const parsed = parseCliArgs();
const result = await runCommercialSaaSPlatform({
    requestText: parsed.requestText,
    answers: parseAnswersInput(parsed),
    interactive: parsed.interactive
});

if (!result.success) {
    process.exit(1);
}

