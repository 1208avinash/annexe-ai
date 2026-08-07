export default class BlueprintValidator {

    validate(blueprint) {

        const checks = [
            {
                rule: "Blueprint present",
                passed: Boolean(blueprint)
            },
            {
                rule: "Blueprint has projectId",
                passed: Boolean(blueprint?.projectId)
            },
            {
                rule: "Blueprint has templateId",
                passed: Boolean(blueprint?.templateId)
            },
            {
                rule: "Blueprint has engineeringPlan",
                passed: Boolean(blueprint?.engineeringPlan)
            },
            {
                rule: "Blueprint has files",
                passed: Array.isArray(blueprint?.files) && blueprint.files.length > 0
            }
        ];

        return {
            approved: checks.every(check => check.passed),
            checks,
            errors: checks.filter(check => !check.passed).map(check => check.rule)
        };

    }

}
