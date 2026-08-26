function buildSubject(subject = "", locale = "en-US") {
    if (/^re:/i.test(subject)) {
        return subject;
    }

    return locale.startsWith("fr")
        ? `Re: ${subject}`.trim()
        : `Re: ${subject}`.trim();
}

function buildBody({ email, classification, locale, language }) {
    const sender = email.from ?? "there";
    const category = classification.category ?? "GENERAL";

    if (locale.startsWith("fr") || language === "French") {
        return [
            `Bonjour ${sender},`,
            "",
            `Merci pour votre message concernant ${category.toLowerCase()}.`,
            "Nous avons préparé une réponse en brouillon pour révision humaine.",
            "",
            "Cordialement,",
            "ANNEXE AI"
        ].join("\n");
    }

    return [
        `Hello ${sender},`,
        "",
        `Thank you for reaching out regarding ${category.toLowerCase()}.`,
        "We have prepared a draft response for human review.",
        "",
        "Best regards,",
        "ANNEXE AI"
    ].join("\n");
}

export default class EmailReplyAgent {
    generateDraft(input = {}) {
        const email = input.email ?? {};
        const classification = input.classification ?? {};
        const languageContext = input.languageContext ?? {};
        const locale = languageContext.locale ?? "en-US";
        const language = languageContext.language ?? "English";

        return {
            status: "DRAFT",
            subject: buildSubject(email.subject ?? "", locale),
            body: buildBody({
                email,
                classification,
                locale,
                language
            }),
            requiresApproval: true,
            language,
            locale
        };
    }
}
