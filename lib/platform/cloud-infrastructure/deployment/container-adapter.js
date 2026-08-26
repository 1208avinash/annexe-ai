export default class ContainerAdapter {
  constructor({ runtime = "node", image = "annexe-ai/cloud-infrastructure:latest" } = {}) {
    this.runtime = runtime;
    this.image = image;
  }

  describe() {
    return {
      runtime: this.runtime,
      image: this.image,
      status: "READY"
    };
  }
}
