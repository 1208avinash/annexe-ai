export default class ProjectTimelineService {
  build(input = {}) {
    const timeline = input.timeline ?? {};

    return {
      startedAt: timeline.startedAt ?? new Date().toISOString(),
      estimatedCompletion: timeline.estimatedCompletion ?? "Pending",
      currentPhase: timeline.currentPhase ?? "Engineering",
      phases: timeline.phases ?? [],
      checkpoints: input.checkpoints ?? [
        "Proposal",
        "Architecture",
        "Engineering",
        "QA",
        "Security",
        "Deployment"
      ]
    };
  }
}
