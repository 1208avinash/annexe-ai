const SOFTWARE_COPY = {
    English: {
        screens: {
            login: "Login",
            dashboard: "Dashboard",
            customers: "Customer Management",
            settings: "Settings",
            reports: "Reports"
        },
        buttons: {
            enter: "Enter ANNEXE AI",
            explore: "Explore Capabilities",
            save: "Save",
            cancel: "Cancel"
        },
        errorMessages: {
            network: "Network request failed.",
            generic: "Unable to complete the action."
        }
    },
    French: {
        screens: {
            login: "Connexion",
            dashboard: "Tableau de bord",
            customers: "Gestion des clients",
            settings: "Paramètres",
            reports: "Rapports"
        },
        buttons: {
            enter: "Entrer dans ANNEXE AI",
            explore: "Explorer les capacités",
            save: "Enregistrer",
            cancel: "Annuler"
        },
        errorMessages: {
            network: "La requête réseau a échoué.",
            generic: "Impossible de terminer l'action."
        }
    },
    Spanish: {
        screens: {
            login: "Inicio de sesión",
            dashboard: "Panel de control",
            customers: "Gestión de clientes",
            settings: "Configuración",
            reports: "Informes"
        },
        buttons: {
            enter: "Entrar en ANNEXE AI",
            explore: "Explorar capacidades",
            save: "Guardar",
            cancel: "Cancelar"
        },
        errorMessages: {
            network: "La solicitud de red falló.",
            generic: "No se pudo completar la acción."
        }
    },
    German: {
        screens: {
            login: "Anmeldung",
            dashboard: "Dashboard",
            customers: "Kundenverwaltung",
            settings: "Einstellungen",
            reports: "Berichte"
        },
        buttons: {
            enter: "ANNEXE AI öffnen",
            explore: "Funktionen erkunden",
            save: "Speichern",
            cancel: "Abbrechen"
        },
        errorMessages: {
            network: "Netzwerkanfrage fehlgeschlagen.",
            generic: "Die Aktion konnte nicht abgeschlossen werden."
        }
    },
    Arabic: {
        screens: {
            login: "تسجيل الدخول",
            dashboard: "لوحة التحكم",
            customers: "إدارة العملاء",
            settings: "الإعدادات",
            reports: "التقارير"
        },
        buttons: {
            enter: "الدخول إلى ANNEXE AI",
            explore: "استكشاف القدرات",
            save: "حفظ",
            cancel: "إلغاء"
        },
        errorMessages: {
            network: "فشل طلب الشبكة.",
            generic: "تعذر إكمال الإجراء."
        }
    },
    Hindi: {
        screens: {
            login: "लॉगिन",
            dashboard: "डैशबोर्ड",
            customers: "ग्राहक प्रबंधन",
            settings: "सेटिंग्स",
            reports: "रिपोर्ट"
        },
        buttons: {
            enter: "ANNEXE AI में प्रवेश करें",
            explore: "क्षमताएँ देखें",
            save: "सहेजें",
            cancel: "रद्द करें"
        },
        errorMessages: {
            network: "नेटवर्क अनुरोध विफल हुआ।",
            generic: "क्रिया पूरी नहीं की जा सकी।"
        }
    },
    Chinese: {
        screens: {
            login: "登录",
            dashboard: "仪表板",
            customers: "客户管理",
            settings: "设置",
            reports: "报告"
        },
        buttons: {
            enter: "进入 ANNEXE AI",
            explore: "探索能力",
            save: "保存",
            cancel: "取消"
        },
        errorMessages: {
            network: "网络请求失败。",
            generic: "无法完成操作。"
        }
    },
    Japanese: {
        screens: {
            login: "ログイン",
            dashboard: "ダッシュボード",
            customers: "顧客管理",
            settings: "設定",
            reports: "レポート"
        },
        buttons: {
            enter: "ANNEXE AI に入る",
            explore: "機能を見る",
            save: "保存",
            cancel: "キャンセル"
        },
        errorMessages: {
            network: "ネットワークリクエストに失敗しました。",
            generic: "操作を完了できませんでした。"
        }
    },
    Portuguese: {
        screens: {
            login: "Login",
            dashboard: "Painel",
            customers: "Gestão de clientes",
            settings: "Configurações",
            reports: "Relatórios"
        },
        buttons: {
            enter: "Entrar no ANNEXE AI",
            explore: "Explorar recursos",
            save: "Salvar",
            cancel: "Cancelar"
        },
        errorMessages: {
            network: "Falha na requisição de rede.",
            generic: "Não foi possível concluir a ação."
        }
    },
    Italian: {
        screens: {
            login: "Accesso",
            dashboard: "Cruscotto",
            customers: "Gestione clienti",
            settings: "Impostazioni",
            reports: "Rapporti"
        },
        buttons: {
            enter: "Accedi ad ANNEXE AI",
            explore: "Esplora le funzionalità",
            save: "Salva",
            cancel: "Annulla"
        },
        errorMessages: {
            network: "Richiesta di rete non riuscita.",
            generic: "Impossibile completare l'azione."
        }
    }
};

export default class SoftwareLocalizationAgent {
    localize(input = {}) {
        const language = input.language ?? "English";
        const pack = SOFTWARE_COPY[language] ?? SOFTWARE_COPY.English;

        return {
            language,
            locale: input.locale ?? "en-US",
            localizedStrings: {
                ...pack.screens,
                ...pack.buttons,
                ...pack.errorMessages
            },
            screens: pack.screens,
            buttons: pack.buttons,
            errorMessages: pack.errorMessages,
            rtl: input.culturalAdaptation?.readingDirection === "rtl",
            localizedAt: new Date().toISOString()
        };
    }
}
