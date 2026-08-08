import {
    parseCliArgs,
    parseAnswersInput,
    runApplicationGeneration
} from "./lib/generation/application-generator.js";

const parsed = parseCliArgs();
const result = await runApplicationGeneration({
    type: parsed.type,
    requestText: parsed.requestText,
    answers: parseAnswersInput(parsed),
    interactive: parsed.interactive
});

if (!result.success) {
    process.exit(1);
}
