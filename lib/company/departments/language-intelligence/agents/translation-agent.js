function escapeRegex(value) {
    return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TRANSLATION_DICTIONARIES = {
    English: {
        Login: "Login",
        Dashboard: "Dashboard",
        Settings: "Settings",
        Customers: "Customers",
        Reports: "Reports",
        Save: "Save",
        Cancel: "Cancel",
        Search: "Search",
        Notifications: "Notifications",
        "User Manual": "User Manual",
        "API Documentation": "API Documentation",
        Proposal: "Proposal"
    },
    French: {
        Login: "Connexion",
        Dashboard: "Tableau de bord",
        Settings: "Paramètres",
        Customers: "Clients",
        Reports: "Rapports",
        Save: "Enregistrer",
        Cancel: "Annuler",
        Search: "Rechercher",
        Notifications: "Notifications",
        "User Manual": "Manuel utilisateur",
        "API Documentation": "Documentation API",
        Proposal: "Proposition"
    },
    Spanish: {
        Login: "Inicio de sesión",
        Dashboard: "Panel de control",
        Settings: "Configuración",
        Customers: "Clientes",
        Reports: "Informes",
        Save: "Guardar",
        Cancel: "Cancelar",
        Search: "Buscar",
        Notifications: "Notificaciones",
        "User Manual": "Manual de usuario",
        "API Documentation": "Documentación de API",
        Proposal: "Propuesta"
    },
    German: {
        Login: "Anmeldung",
        Dashboard: "Dashboard",
        Settings: "Einstellungen",
        Customers: "Kunden",
        Reports: "Berichte",
        Save: "Speichern",
        Cancel: "Abbrechen",
        Search: "Suchen",
        Notifications: "Benachrichtigungen",
        "User Manual": "Benutzerhandbuch",
        "API Documentation": "API-Dokumentation",
        Proposal: "Angebot"
    },
    Arabic: {
        Login: "تسجيل الدخول",
        Dashboard: "لوحة التحكم",
        Settings: "الإعدادات",
        Customers: "العملاء",
        Reports: "التقارير",
        Save: "حفظ",
        Cancel: "إلغاء",
        Search: "بحث",
        Notifications: "الإشعارات",
        "User Manual": "دليل المستخدم",
        "API Documentation": "توثيق واجهة البرمجة",
        Proposal: "عرض"
    },
    Hindi: {
        Login: "लॉगिन",
        Dashboard: "डैशबोर्ड",
        Settings: "सेटिंग्स",
        Customers: "ग्राहक",
        Reports: "रिपोर्ट",
        Save: "सहेजें",
        Cancel: "रद्द करें",
        Search: "खोजें",
        Notifications: "सूचनाएं",
        "User Manual": "उपयोगकर्ता मार्गदर्शिका",
        "API Documentation": "API दस्तावेज़",
        Proposal: "प्रस्ताव"
    },
    Chinese: {
        Login: "登录",
        Dashboard: "仪表板",
        Settings: "设置",
        Customers: "客户",
        Reports: "报告",
        Save: "保存",
        Cancel: "取消",
        Search: "搜索",
        Notifications: "通知",
        "User Manual": "用户手册",
        "API Documentation": "API 文档",
        Proposal: "提案"
    },
    Japanese: {
        Login: "ログイン",
        Dashboard: "ダッシュボード",
        Settings: "設定",
        Customers: "顧客",
        Reports: "レポート",
        Save: "保存",
        Cancel: "キャンセル",
        Search: "検索",
        Notifications: "通知",
        "User Manual": "ユーザーマニュアル",
        "API Documentation": "API ドキュメント",
        Proposal: "提案"
    },
    Portuguese: {
        Login: "Entrar",
        Dashboard: "Painel",
        Settings: "Configurações",
        Customers: "Clientes",
        Reports: "Relatórios",
        Save: "Salvar",
        Cancel: "Cancelar",
        Search: "Pesquisar",
        Notifications: "Notificações",
        "User Manual": "Manual do usuário",
        "API Documentation": "Documentação da API",
        Proposal: "Proposta"
    },
    Italian: {
        Login: "Accesso",
        Dashboard: "Cruscotto",
        Settings: "Impostazioni",
        Customers: "Clienti",
        Reports: "Rapporti",
        Save: "Salva",
        Cancel: "Annulla",
        Search: "Cerca",
        Notifications: "Notifiche",
        "User Manual": "Manuale utente",
        "API Documentation": "Documentazione API",
        Proposal: "Proposta"
    }
};

function translateText(text, dictionary) {
    let output = String(text ?? "");

    for (const [source, target] of Object.entries(dictionary)) {
        output = output.replace(new RegExp(`\\b${escapeRegex(source)}\\b`, "gi"), target);
    }

    return output;
}

export default class TranslationAgent {
    translate(input = {}) {
        const targetLanguage = input.targetLanguage ?? "English";
        const dictionary = TRANSLATION_DICTIONARIES[targetLanguage] ?? TRANSLATION_DICTIONARIES.English;
        const sourceText = String(input.text ?? "");

        return {
            sourceLanguage: input.sourceLanguage ?? "English",
            targetLanguage,
            locale: input.locale ?? "en-US",
            translatedText: translateText(sourceText, dictionary),
            glossary: dictionary,
            translatedAt: new Date().toISOString()
        };
    }

    translatePhrase(phrase, targetLanguage) {
        const dictionary = TRANSLATION_DICTIONARIES[targetLanguage] ?? TRANSLATION_DICTIONARIES.English;
        return dictionary[phrase] ?? phrase;
    }
}
