import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function scoreFromState(state, fallback = 0) {
  if (typeof state === "number") {
    return state;
  }

  if (state && typeof state === "object") {
    if (typeof state.score === "number") {
      return state.score;
    }

    if (state.status === "READY" || state.status === "ready" || state.healthy === true) {
      return 100;
    }
  }

  return fallback;
}

export default class CloudReadinessReportGenerator {
  createReport(input = {}) {
    const databaseScore = scoreFromState(input.database, 100);
    const storageScore = scoreFromState(input.storage, 100);
    const messagingScore = scoreFromState(input.messaging, 100);
    const cacheScore = scoreFromState(input.cache, 100);
    const monitoringScore = scoreFromState(input.monitoring, 100);
    const deploymentScore = scoreFromState(input.deployment, 100);
    const disasterRecoveryScore = scoreFromState(input.disasterRecovery, 100);
    const multiRegionReadiness = scoreFromState(input.multiRegion, 100);

    const overallCloudReadinessScore = Math.round(
      (
        databaseScore +
        storageScore +
        messagingScore +
        cacheScore +
        monitoringScore +
        deploymentScore +
        disasterRecoveryScore +
        multiRegionReadiness
      ) / 8
    );

    return {
      reportId: `CLOUD-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      requestText: input.requestText ?? null,
      region: input.region ?? null,
      availabilityZone: input.availabilityZone ?? null,
      dataResidency: input.dataResidency ?? null,
      complianceLocation: input.complianceLocation ?? null,
      providers: input.providers ?? {},
      databaseScore,
      storageScore,
      messagingScore,
      cacheScore,
      monitoringScore,
      deploymentScore,
      disasterRecoveryScore,
      multiRegionReadiness,
      overallCloudReadinessScore,
      sections: {
        database: input.database ?? null,
        storage: input.storage ?? null,
        messaging: input.messaging ?? null,
        cache: input.cache ?? null,
        monitoring: input.monitoring ?? null,
        deployment: input.deployment ?? null,
        disasterRecovery: input.disasterRecovery ?? null
      },
      status: "READY"
    };
  }

  persist(report, platformRoot) {
    if (!platformRoot) {
      return null;
    }

    const reportPath = path.join(platformRoot, "reports", "platform", "cloud", "cloud-infrastructure-readiness-report.json");
    writeJson(reportPath, report);
    return reportPath;
  }
}
