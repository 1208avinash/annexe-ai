export default class ProjectCache {
  constructor({ cacheManager } = {}) {
    this.cacheManager = cacheManager;
  }

  setProject(projectId, value) {
    return this.cacheManager.set(`project:${projectId}`, value, 1000 * 60 * 15);
  }

  getProject(projectId) {
    return this.cacheManager.get(`project:${projectId}`);
  }
}
