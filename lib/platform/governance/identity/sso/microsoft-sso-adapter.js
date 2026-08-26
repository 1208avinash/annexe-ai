export default class MicrosoftSsoAdapter {
    constructor({ providerName = "Microsoft Entra ID" } = {}) {
        this.providerName = providerName;
    }

    authenticate(input = {}) {
        return {
            provider: this.providerName,
            authenticated: false,
            user: input.user ?? null,
            directorySynced: false,
            ready: true,
            timestamp: new Date().toISOString()
        };
    }

    validateUser(user = {}) {
        return {
            provider: this.providerName,
            valid: Boolean(user.email || user.id),
            reason: user.email ? "User identity present." : "Missing user identity.",
            timestamp: new Date().toISOString()
        };
    }

    syncDirectory(input = {}) {
        return {
            provider: this.providerName,
            synced: true,
            users: input.users ?? [],
            timestamp: new Date().toISOString()
        };
    }
}
