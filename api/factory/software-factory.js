// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 20.1
// Software Factory
// Public Entry Point To The Autonomous Software Factory
// ───────────────────────────────────────────────────────────────

export default class SoftwareFactory {

    constructor({

        projectExecutor,

        repositoryExecutor = null,

        bugFixExecutor = null,

        featureExecutor = null,

        reviewExecutor = null,

        deploymentExecutor = null

    }) {

        if (!projectExecutor)
            throw new Error(
                "ProjectExecutor is required."
            );

        this.projectExecutor =
            projectExecutor;

        this.repositoryExecutor =
            repositoryExecutor;

        this.bugFixExecutor =
            bugFixExecutor;

        this.featureExecutor =
            featureExecutor;

        this.reviewExecutor =
            reviewExecutor;

        this.deploymentExecutor =
            deploymentExecutor;

    }

    // ----------------------------------------------------------
    // Build New Software
    // ----------------------------------------------------------

    async buildSoftware(request) {

        return await this.projectExecutor.execute(
            request
        );

    }

    // ----------------------------------------------------------
    // Improve Existing Repository
    // ----------------------------------------------------------

    async improveRepository(request) {

        if (!this.repositoryExecutor)
            throw new Error(
                "RepositoryExecutor not configured."
            );

        return await this.repositoryExecutor.execute(
            request
        );

    }

    // ----------------------------------------------------------
    // Bug Fix
    // ----------------------------------------------------------

    async fixBug(request) {

        if (!this.bugFixExecutor)
            throw new Error(
                "BugFixExecutor not configured."
            );

        return await this.bugFixExecutor.execute(
            request
        );

    }

    // ----------------------------------------------------------
    // Feature Development
    // ----------------------------------------------------------

    async addFeature(request) {

        if (!this.featureExecutor)
            throw new Error(
                "FeatureExecutor not configured."
            );

        return await this.featureExecutor.execute(
            request
        );

    }

    // ----------------------------------------------------------
    // Code Review
    // ----------------------------------------------------------

    async reviewCode(request) {

        if (!this.reviewExecutor)
            throw new Error(
                "ReviewExecutor not configured."
            );

        return await this.reviewExecutor.execute(
            request
        );

    }

    // ----------------------------------------------------------
    // Deployment
    // ----------------------------------------------------------

    async deploy(request) {

        if (!this.deploymentExecutor)
            throw new Error(
                "DeploymentExecutor not configured."
            );

        return await this.deploymentExecutor.execute(
            request
        );

    }

}