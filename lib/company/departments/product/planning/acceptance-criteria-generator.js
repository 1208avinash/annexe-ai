export default class AcceptanceCriteriaGenerator {
    generate(input = {}) {
        const stories = input.stories ?? [];

        return stories.map(story => ({
            feature: story.feature,
            must: [
                `Display and support ${story.feature.toLowerCase()}.`,
                "Pass QA checks.",
                "Respect user permissions.",
                "Deliver consistent product behavior."
            ]
        }));
    }
}
