function parseAdminIds(value = "") {
    return String(value)
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}

export default class AdminAccessControl {
    constructor({ adminIds = process.env.TELEGRAM_ADMIN_IDS ?? "" } = {}) {
        this.adminIds = parseAdminIds(adminIds);
    }

    authorize(input = {}) {
        const userId = String(input.userId ?? "");
        const authorized = this.adminIds.length === 0 ? false : this.adminIds.includes(userId);
        return {
            authorized
        };
    }

    deny() {
        return {
            status: "ACCESS_DENIED"
        };
    }
}
