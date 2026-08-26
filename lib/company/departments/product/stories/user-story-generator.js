export default class UserStoryGenerator {
    generate(input = {}) {
        const priorities = input.priorities ?? [];

        return priorities.map(item => ({
            feature: item.feature,
            story: `As a ${input.targetUser ?? "user"} I want ${item.feature.toLowerCase()} so I can achieve better business outcomes.`,
            requirements: [
                `Support ${item.feature.toLowerCase()}.`,
                "Work reliably in the company workflow."
            ]
        }));
    }
}
