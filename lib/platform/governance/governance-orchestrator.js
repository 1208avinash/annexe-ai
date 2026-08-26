import SsoManager from "./identity/sso/sso-manager.js";
import MfaManager from "./identity/mfa/mfa-manager.js";
import UserDirectoryManager from "./identity/users/user-directory-manager.js";
import RoleManager from "./identity/roles/role-manager.js";
import OrganizationRoleManager from "./identity/roles/organization-role-manager.js";
import PermissionManager from "./security/permissions/permission-manager.js";
import AccessPolicyEngine from "./security/policies/access-policy-engine.js";
import ResourceAccessController from "./security/access-control/resource-access-controller.js";
import ComplianceOrchestrator from "./compliance/compliance-orchestrator.js";
import AuditTrailManager from "./audit/audit-trail-manager.js";
import EvidenceGenerator from "./audit/evidence-generator.js";
import ComplianceReportGenerator from "./audit/compliance-report-generator.js";
import DataGovernanceManager from "./data/data-governance-manager.js";
import GovernanceReportGenerator from "./reports/governance-report-generator.js";

function scoreIdentity(identity, sso, mfa, policy, compliance, auditTrail, dataGovernance) {
    const values = [
        identity?.ready ? 100 : 0,
        sso?.ready ? 100 : 0,
        mfa?.ready ? 100 : 0,
        policy?.ready ? 100 : 0,
        compliance?.complianceScore ?? 0,
        auditTrail?.length ? 100 : 0,
        dataGovernance?.score ?? 0
    ];

    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default class GovernanceOrchestrator {
    constructor({
        ssoManager = new SsoManager(),
        mfaManager = new MfaManager(),
        userDirectoryManager = new UserDirectoryManager(),
        roleManager = new RoleManager(),
        organizationRoleManager = new OrganizationRoleManager(),
        permissionManager = new PermissionManager(),
        accessPolicyEngine = new AccessPolicyEngine(),
        resourceAccessController = new ResourceAccessController(),
        complianceOrchestrator = new ComplianceOrchestrator(),
        auditTrailManager = new AuditTrailManager(),
        evidenceGenerator = new EvidenceGenerator(),
        complianceReportGenerator = new ComplianceReportGenerator(),
        dataGovernanceManager = new DataGovernanceManager(),
        reportGenerator = new GovernanceReportGenerator()
    } = {}) {
        this.ssoManager = ssoManager;
        this.mfaManager = mfaManager;
        this.userDirectoryManager = userDirectoryManager;
        this.roleManager = roleManager;
        this.organizationRoleManager = organizationRoleManager;
        this.permissionManager = permissionManager;
        this.accessPolicyEngine = accessPolicyEngine;
        this.resourceAccessController = resourceAccessController;
        this.complianceOrchestrator = complianceOrchestrator;
        this.auditTrailManager = auditTrailManager;
        this.evidenceGenerator = evidenceGenerator;
        this.complianceReportGenerator = complianceReportGenerator;
        this.dataGovernanceManager = dataGovernanceManager;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const identity = this.userDirectoryManager.build({
            organization: input.organization,
            users: input.users
        });
        const roles = this.roleManager.build(input);
        const organizationRoles = this.organizationRoleManager.build({
            organization: identity.organization,
            departmentAccess: input.departmentAccess
        });
        const sso = this.ssoManager.authenticate({
            organization: identity.organization,
            users: identity.users,
            user: input.user ?? identity.users[0] ?? null
        });
        const ssoValidation = this.ssoManager.validateUser(input.user ?? identity.users[0] ?? {});
        const ssoDirectory = this.ssoManager.syncDirectory({ users: identity.users });
        const mfa = this.mfaManager.enableMFA({
            user: input.user ?? identity.users[0] ?? null,
            methods: input.mfaMethods
        });
        const permission = this.permissionManager.evaluate({
            role: input.role ?? "Administrator",
            permission: input.permission ?? "audit.view"
        });
        const policy = this.accessPolicyEngine.evaluate({
            user: input.user ?? identity.users[0] ?? null,
            organization: identity.organization,
            role: input.role ?? "Administrator",
            permission: input.permission ?? "audit.view",
            resource: input.resource ?? "governance-report",
            permissionResult: permission,
            policy: input.policy ?? "enterprise-governance-policy"
        });
        const accessControl = this.resourceAccessController.authorize({
            user: input.user ?? identity.users[0] ?? null,
            organization: identity.organization,
            role: input.role ?? "Administrator",
            permission: input.permission ?? "audit.view",
            resource: input.resource ?? "governance-report"
        });
        const compliance = this.complianceOrchestrator.evaluate(input);
        const dataGovernance = this.dataGovernanceManager.build(input);

        const auditTrail = [
            this.auditTrailManager.record({
                actor: input.user?.email ?? "system",
                action: "identity.initialize",
                resource: "organization",
                result: "approved"
            }),
            this.auditTrailManager.record({
                actor: "system",
                action: "sso.ready",
                resource: "sso",
                result: "approved"
            }),
            this.auditTrailManager.record({
                actor: "system",
                action: "mfa.enabled",
                resource: "authentication",
                result: "approved"
            }),
            this.auditTrailManager.record({
                actor: input.user?.email ?? "system",
                action: "policy.evaluate",
                resource: input.resource ?? "governance-report",
                result: accessControl.allowed ? "approved" : "denied"
            })
        ];

        const evidence = this.evidenceGenerator.generate({
            identity,
            compliance,
            auditTrail,
            dataGovernance
        });
        const complianceSummary = this.complianceReportGenerator.generate({
            compliance
        });

        const report = this.reportGenerator.createReport({
            projectId: input.projectId ?? null,
            identity,
            sso: {
                ...sso,
                validation: ssoValidation,
                directory: ssoDirectory
            },
            mfa,
            policy: {
                ...policy,
                accessControl,
                ready: true
            },
            compliance: {
                ...compliance,
                report: complianceSummary
            },
            auditTrail,
            evidence,
            dataGovernance
        });
        report.identityScore = scoreIdentity(identity, sso, mfa, policy, compliance, auditTrail, dataGovernance);
        report.overallGovernanceScore = Math.round((report.identityScore + report.complianceScore + report.dataGovernanceScore + report.auditReadiness) / 4);
        const persisted = this.reportGenerator.persist(report, input.platformRoot ?? null);

        return {
            identity,
            roles,
            organizationRoles,
            sso,
            ssoValidation,
            ssoDirectory,
            mfa,
            permission,
            policy,
            accessControl,
            compliance,
            auditTrail,
            evidence,
            complianceReport: complianceSummary,
            dataGovernance,
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
