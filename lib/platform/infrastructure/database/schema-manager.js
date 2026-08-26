import crypto from "crypto";

function createCollectionSchema({ name, primaryKey = "id", fields = {} }) {
  return {
    name,
    primaryKey,
    fields: {
      id: { type: "string", required: true },
      createdAt: { type: "string", required: true },
      updatedAt: { type: "string", required: true },
      ...fields
    }
  };
}

export default class SchemaManager {
  constructor({ version = "1.0.0" } = {}) {
    this.version = version;
  }

  createSchema() {
    return {
      version: this.version,
      generatedAt: new Date().toISOString(),
      collections: {
        users: createCollectionSchema({
          name: "users",
          fields: {
            email: { type: "string", required: true, unique: true },
            name: { type: "string", required: true },
            role: { type: "string", required: true },
            organizationId: { type: "string", required: false },
            passwordHash: { type: "string", required: true },
            passwordSalt: { type: "string", required: true },
            passwordAlgorithm: { type: "string", required: true },
            status: { type: "string", required: true },
            lastLoginAt: { type: "string", required: false }
          }
        }),
        organizations: createCollectionSchema({
          name: "organizations",
          fields: {
            name: { type: "string", required: true },
            industry: { type: "string", required: false },
            ownerUserId: { type: "string", required: true },
            plan: { type: "string", required: true },
            status: { type: "string", required: true }
          }
        }),
        projects: createCollectionSchema({
          name: "projects",
          fields: {
            organizationId: { type: "string", required: true },
            ownerUserId: { type: "string", required: true },
            name: { type: "string", required: true },
            industry: { type: "string", required: false },
            status: { type: "string", required: true },
            billingStatus: { type: "string", required: true },
            progress: { type: "number", required: true },
            description: { type: "string", required: false }
          }
        }),
        projectReports: createCollectionSchema({
          name: "projectReports",
          fields: {
            projectId: { type: "string", required: true },
            organizationId: { type: "string", required: true },
            reportType: { type: "string", required: true },
            title: { type: "string", required: true },
            payload: { type: "object", required: true }
          }
        }),
        payments: createCollectionSchema({
          name: "payments",
          fields: {
            projectId: { type: "string", required: true },
            organizationId: { type: "string", required: true },
            invoiceId: { type: "string", required: true },
            amount: { type: "number", required: true },
            currency: { type: "string", required: true },
            status: { type: "string", required: true },
            milestone: { type: "string", required: true },
            gateway: { type: "string", required: false }
          }
        }),
        upgrades: createCollectionSchema({
          name: "upgrades",
          fields: {
            projectId: { type: "string", required: true },
            organizationId: { type: "string", required: true },
            title: { type: "string", required: true },
            description: { type: "string", required: true },
            status: { type: "string", required: true },
            advancePercent: { type: "number", required: true },
            completionPercent: { type: "number", required: true },
            estimate: { type: "number", required: false },
            milestones: { type: "object", required: false }
          }
        }),
        auditLogs: createCollectionSchema({
          name: "auditLogs",
          fields: {
            actorId: { type: "string", required: false },
            action: { type: "string", required: true },
            entityType: { type: "string", required: true },
            entityId: { type: "string", required: false },
            metadata: { type: "object", required: true }
          }
        }),
        events: createCollectionSchema({
          name: "events",
          fields: {
            stream: { type: "string", required: true },
            eventType: { type: "string", required: true },
            payload: { type: "object", required: true }
          }
        }),
        sessions: createCollectionSchema({
          name: "sessions",
          fields: {
            userId: { type: "string", required: true },
            tokenId: { type: "string", required: true },
            expiresAt: { type: "string", required: true },
            status: { type: "string", required: true }
          }
        })
      }
    };
  }

  createSeedState() {
    const schema = this.createSchema();
    const collections = {};

    for (const name of Object.keys(schema.collections)) {
      collections[name] = [];
    }

    return {
      schemaVersion: schema.version,
      databaseId: crypto.randomUUID(),
      generatedAt: schema.generatedAt,
      collections
    };
  }
}
