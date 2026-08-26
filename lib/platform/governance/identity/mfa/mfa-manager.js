import OtpService from "./otp-service.js";
import RecoveryManager from "./recovery-manager.js";

export default class MfaManager {
    constructor({
        otpService = new OtpService(),
        recoveryManager = new RecoveryManager()
    } = {}) {
        this.otpService = otpService;
        this.recoveryManager = recoveryManager;
    }

    enableMFA(input = {}) {
        const challenge = this.createChallenge(input);
        return {
            enabled: true,
            methods: input.methods ?? ["authenticator-app", "email-otp", "sms-otp"],
            challenge,
            recoveryCodes: this.recoveryManager.generateRecoveryCodes(),
            ready: true
        };
    }

    disableMFA(input = {}) {
        return {
            enabled: false,
            userId: input.user?.id ?? null,
            ready: true
        };
    }

    createChallenge(input = {}) {
        const challenge = this.otpService.generate();
        return {
            challenge: challenge.code,
            expiresAt: challenge.expiresAt,
            channel: input.channel ?? "authenticator-app"
        };
    }

    verifyChallenge(input = {}) {
        return {
            verified: this.otpService.verify({
                code: input.challenge,
                challenge: input.code
            }),
            ready: true
        };
    }

    generateRecoveryCodes(input = {}) {
        return {
            userId: input.user?.id ?? null,
            recoveryCodes: this.recoveryManager.generateRecoveryCodes(),
            ready: true
        };
    }
}
