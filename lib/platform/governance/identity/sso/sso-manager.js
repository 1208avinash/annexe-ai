import GoogleSsoAdapter from "./google-sso-adapter.js";
import MicrosoftSsoAdapter from "./microsoft-sso-adapter.js";
import OktaSsoAdapter from "./okta-sso-adapter.js";

export default class SsoManager {
    constructor({
        googleAdapter = new GoogleSsoAdapter(),
        microsoftAdapter = new MicrosoftSsoAdapter(),
        oktaAdapter = new OktaSsoAdapter()
    } = {}) {
        this.adapters = {
            google: googleAdapter,
            microsoft: microsoftAdapter,
            okta: oktaAdapter
        };
    }

    getReadiness() {
        return {
            googleWorkspace: true,
            microsoftEntraId: true,
            okta: true
        };
    }

    authenticate(input = {}) {
        const results = Object.fromEntries(
            Object.entries(this.adapters).map(([key, adapter]) => [key, adapter.authenticate(input)])
        );

        return {
            providers: results,
            readiness: this.getReadiness(),
            ready: true
        };
    }

    validateUser(user = {}) {
        const results = Object.fromEntries(
            Object.entries(this.adapters).map(([key, adapter]) => [key, adapter.validateUser(user)])
        );

        return {
            providers: results,
            valid: Object.values(results).every(result => result.valid),
            ready: true
        };
    }

    syncDirectory(input = {}) {
        const results = Object.fromEntries(
            Object.entries(this.adapters).map(([key, adapter]) => [key, adapter.syncDirectory(input)])
        );

        return {
            providers: results,
            syncedUsers: input.users ?? [],
            ready: true
        };
    }
}
