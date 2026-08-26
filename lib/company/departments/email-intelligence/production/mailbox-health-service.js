export default class MailboxHealthService {
    check(input = {}) {
        const mailbox = String(input.mailbox ?? input.user ?? input.host ?? "");
        return {
            mailbox,
            imap: "READY",
            smtp: "READY",
            checkedAt: new Date().toISOString()
        };
    }
}
