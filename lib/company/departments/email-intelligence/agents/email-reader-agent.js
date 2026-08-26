function normalizeAttachments(attachments = []) {
    return attachments.map((attachment, index) => ({
        id: attachment?.id ?? `attachment-${index + 1}`,
        filename: attachment?.filename ?? attachment?.name ?? "attachment",
        contentType: attachment?.contentType ?? attachment?.mimeType ?? null,
        size: attachment?.size ?? null
    }));
}

export default class EmailReaderAgent {
    read(input = {}) {
        const source = input.email ?? input.message ?? input.rawEmail ?? input;
        const attachments = Array.isArray(source?.attachments) ? source.attachments : [];

        return {
            id: source?.id ?? source?.messageId ?? `email-${Date.now()}`,
            from: source?.from ?? source?.sender ?? "",
            to: source?.to ?? source?.recipient ?? "",
            subject: source?.subject ?? "",
            body: source?.body ?? source?.text ?? "",
            receivedAt: source?.receivedAt ?? source?.date ?? new Date().toISOString(),
            attachments: normalizeAttachments(attachments)
        };
    }
}
