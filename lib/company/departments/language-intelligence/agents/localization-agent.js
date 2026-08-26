const LOCALIZATION_PACKS = {
    English: {
        uiLabels: {
            login: "Login",
            dashboard: "Dashboard",
            settings: "Settings",
            customers: "Customers",
            reports: "Reports",
            search: "Search",
            save: "Save",
            cancel: "Cancel"
        },
        menuLabels: {
            home: "Home",
            customers: "Customers",
            analytics: "Analytics",
            settings: "Settings"
        },
        errorMessages: {
            generic: "Something went wrong.",
            network: "Network request failed.",
            validation: "Please review the highlighted fields."
        }
    },
    French: {
        uiLabels: {
            login: "Connexion",
            dashboard: "Tableau de bord",
            settings: "Paramètres",
            customers: "Clients",
            reports: "Rapports",
            search: "Rechercher",
            save: "Enregistrer",
            cancel: "Annuler"
        },
        menuLabels: {
            home: "Accueil",
            customers: "Clients",
            analytics: "Analyses",
            settings: "Paramètres"
        },
        errorMessages: {
            generic: "Une erreur est survenue.",
            network: "La requête réseau a échoué.",
            validation: "Veuillez vérifier les champs surlignés."
        }
    },
    Spanish: {
        uiLabels: {
            login: "Inicio de sesión",
            dashboard: "Panel de control",
            settings: "Configuración",
            customers: "Clientes",
            reports: "Informes",
            search: "Buscar",
            save: "Guardar",
            cancel: "Cancelar"
        },
        menuLabels: {
            home: "Inicio",
            customers: "Clientes",
            analytics: "Analítica",
            settings: "Configuración"
        },
        errorMessages: {
            generic: "Algo salió mal.",
            network: "La solicitud de red falló.",
            validation: "Revise los campos resaltados."
        }
    },
    German: {
        uiLabels: {
            login: "Anmeldung",
            dashboard: "Dashboard",
            settings: "Einstellungen",
            customers: "Kunden",
            reports: "Berichte",
            search: "Suchen",
            save: "Speichern",
            cancel: "Abbrechen"
        },
        menuLabels: {
            home: "Startseite",
            customers: "Kunden",
            analytics: "Analyse",
            settings: "Einstellungen"
        },
        errorMessages: {
            generic: "Etwas ist schiefgelaufen.",
            network: "Netzwerkanfrage fehlgeschlagen.",
            validation: "Bitte prüfen Sie die markierten Felder."
        }
    },
    Arabic: {
        uiLabels: {
            login: "تسجيل الدخول",
            dashboard: "لوحة التحكم",
            settings: "الإعدادات",
            customers: "العملاء",
            reports: "التقارير",
            search: "بحث",
            save: "حفظ",
            cancel: "إلغاء"
        },
        menuLabels: {
            home: "الرئيسية",
            customers: "العملاء",
            analytics: "التحليلات",
            settings: "الإعدادات"
        },
        errorMessages: {
            generic: "حدث خطأ ما.",
            network: "فشل طلب الشبكة.",
            validation: "يرجى مراجعة الحقول المميزة."
        }
    },
    Hindi: {
        uiLabels: {
            login: "लॉगिन",
            dashboard: "डैशबोर्ड",
            settings: "सेटिंग्स",
            customers: "ग्राहक",
            reports: "रिपोर्ट",
            search: "खोजें",
            save: "सहेजें",
            cancel: "रद्द करें"
        },
        menuLabels: {
            home: "होम",
            customers: "ग्राहक",
            analytics: "विश्लेषण",
            settings: "सेटिंग्स"
        },
        errorMessages: {
            generic: "कुछ गलत हो गया।",
            network: "नेटवर्क अनुरोध विफल हुआ।",
            validation: "कृपया हाइलाइट किए गए फ़ील्ड की जांच करें।"
        }
    },
    Chinese: {
        uiLabels: {
            login: "登录",
            dashboard: "仪表板",
            settings: "设置",
            customers: "客户",
            reports: "报告",
            search: "搜索",
            save: "保存",
            cancel: "取消"
        },
        menuLabels: {
            home: "首页",
            customers: "客户",
            analytics: "分析",
            settings: "设置"
        },
        errorMessages: {
            generic: "出了点问题。",
            network: "网络请求失败。",
            validation: "请检查高亮字段。"
        }
    },
    Japanese: {
        uiLabels: {
            login: "ログイン",
            dashboard: "ダッシュボード",
            settings: "設定",
            customers: "顧客",
            reports: "レポート",
            search: "検索",
            save: "保存",
            cancel: "キャンセル"
        },
        menuLabels: {
            home: "ホーム",
            customers: "顧客",
            analytics: "分析",
            settings: "設定"
        },
        errorMessages: {
            generic: "問題が発生しました。",
            network: "ネットワークリクエストに失敗しました。",
            validation: "強調表示された項目を確認してください。"
        }
    },
    Portuguese: {
        uiLabels: {
            login: "Entrar",
            dashboard: "Painel",
            settings: "Configurações",
            customers: "Clientes",
            reports: "Relatórios",
            search: "Pesquisar",
            save: "Salvar",
            cancel: "Cancelar"
        },
        menuLabels: {
            home: "Início",
            customers: "Clientes",
            analytics: "Análises",
            settings: "Configurações"
        },
        errorMessages: {
            generic: "Algo deu errado.",
            network: "Falha na requisição de rede.",
            validation: "Revise os campos destacados."
        }
    },
    Italian: {
        uiLabels: {
            login: "Accesso",
            dashboard: "Cruscotto",
            settings: "Impostazioni",
            customers: "Clienti",
            reports: "Rapporti",
            search: "Cerca",
            save: "Salva",
            cancel: "Annulla"
        },
        menuLabels: {
            home: "Home",
            customers: "Clienti",
            analytics: "Analisi",
            settings: "Impostazioni"
        },
        errorMessages: {
            generic: "Qualcosa è andato storto.",
            network: "Richiesta di rete non riuscita.",
            validation: "Controlla i campi evidenziati."
        }
    }
};

export default class LocalizationAgent {
    create(input = {}) {
        const language = input.language ?? "English";
        const locale = input.locale ?? "en-US";
        const pack = LOCALIZATION_PACKS[language] ?? LOCALIZATION_PACKS.English;

        return {
            language,
            locale,
            uiLabels: pack.uiLabels,
            menuLabels: pack.menuLabels,
            errorMessages: pack.errorMessages,
            createdAt: new Date().toISOString()
        };
    }
}
