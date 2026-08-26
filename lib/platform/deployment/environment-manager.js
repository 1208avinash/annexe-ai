export default class EnvironmentManager {
  create(name) {
    return {
      name,
      status: "ready",
      createdAt: new Date().toISOString()
    };
  }
}
