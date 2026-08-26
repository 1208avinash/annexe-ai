import EnvironmentManager from "./environment-manager.js";
import ReleaseManager from "./release-manager.js";

export default class DeploymentManager {
  constructor({ environmentManager = new EnvironmentManager(), releaseManager = new ReleaseManager() } = {}) {
    this.environmentManager = environmentManager;
    this.releaseManager = releaseManager;
  }

  build() {
    const staging = this.environmentManager.create("staging");
    const production = this.environmentManager.create("production");
    return {
      staging,
      production,
      release: this.releaseManager.release("1.0.0"),
      rollbackEnabled: true
    };
  }
}
