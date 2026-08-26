from .config import settings


SUPPORTED_LOCALES = ["en-US","fr-FR","es-ES","de-DE","ar-SA","hi-IN","zh-CN","ja-JP","pt-BR","it-IT"]
DEFAULT_LOCALE = settings.default_locale
DEFAULT_LANGUAGE = settings.default_language
UI_LABELS = {"login":"Connexion","dashboard":"Tableau de bord","settings":"Paramètres","customers":"Clients","reports":"Rapports","search":"Rechercher","save":"Enregistrer","cancel":"Annuler"}
MENU_LABELS = {"home":"Accueil","customers":"Clients","analytics":"Analyses","settings":"Paramètres"}
ERROR_MESSAGES = {"generic":"Une erreur est survenue.","network":"La requête réseau a échoué.","validation":"Veuillez vérifier les champs surlignés."}


def get_locale_context(locale: str | None = None):
    active_locale = locale or DEFAULT_LOCALE
    return {
        "language": DEFAULT_LANGUAGE,
        "locale": active_locale,
        "supported_locales": SUPPORTED_LOCALES,
        "ui_labels": UI_LABELS,
        "menu_labels": MENU_LABELS,
        "error_messages": ERROR_MESSAGES
    }


def get_error_message(key: str, locale: str | None = None):
    context = get_locale_context(locale)
    return context["error_messages"].get(key, key)
