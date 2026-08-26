export default class DockerManager {
  constructor({ image = "annexe-ai/cloud-infrastructure:latest" } = {}) {
    this.image = image;
  }

  build(environment = "development") {
    return {
      image: this.image,
      environment,
      status: "READY",
      builtAt: new Date().toISOString()
    };
  }
}
