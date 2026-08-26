export default class RtoRpoPlanner {
  constructor({ rtoHours = 4, rpoMinutes = 15 } = {}) {
    this.rtoHours = rtoHours;
    this.rpoMinutes = rpoMinutes;
  }

  build() {
    return {
      rtoHours: this.rtoHours,
      rpoMinutes: this.rpoMinutes,
      status: "READY"
    };
  }
}
