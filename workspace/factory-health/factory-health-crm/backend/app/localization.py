from __future__ import annotations

from typing import Any

from fastapi import Request

from .config import settings


SUPPORTED_LOCALES = ["en-US"]
RTL_LOCALES = ["ar-SA","he-IL","fa-IR","ur-PK"]
DEFAULT_LOCALE = settings.default_locale
DEFAULT_LANGUAGE = settings.default_language
TRANSLATIONS = {
  "en-US": {
    "errors": {
      "auth": {
        "missingBearerToken": "Missing bearer token",
        "invalidOrExpiredToken": "Invalid or expired token",
        "invalidCredentials": "Invalid email or password",
        "userNotFoundOrInactive": "User not found or inactive"
      },
      "customers": {
        "notFound": "Customer not found"
      },
      "dashboard": {
        "unavailable": "Unable to load dashboard"
      },
      "general": {
        "validation": "Please review the highlighted fields.",
        "generic": "Something went wrong.",
        "network": "Network request failed."
      }
    }
  }
}


def normalize_locale(locale: str | None):
    if not locale:
        return None
    return str(locale).strip().replace("_", "-")


def parse_accept_language(header_value: str | None):
    if not header_value:
        return []
    matches = []
    for part in header_value.split(","):
        token = part.split(";", 1)[0].strip()
        if token:
            matches.append(token)
    return matches


def resolve_locale(locale: str | None = None, accept_language: str | None = None):
    candidates = [normalize_locale(locale)]
    candidates.extend(normalize_locale(value) for value in parse_accept_language(accept_language))
    candidates.extend([normalize_locale(DEFAULT_LOCALE), "en-US"])

    for candidate in candidates:
        if candidate and candidate in SUPPORTED_LOCALES:
            return candidate
        if candidate and "-" in candidate:
            language_prefix = candidate.split("-", 1)[0]
            for supported_locale in SUPPORTED_LOCALES:
                if supported_locale.startswith(language_prefix):
                    return supported_locale

    return "en-US"


def resolve_request_locale(request: Request | None = None, locale: str | None = None):
    if request is None:
        return resolve_locale(locale)
    header_locale = request.headers.get("X-Locale") or locale
    accept_language = request.headers.get("Accept-Language")
    return resolve_locale(header_locale, accept_language)


def _resolve_path(source: dict[str, Any], key_path: str):
    current: Any = source
    for key in key_path.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current


def _format_message(message: Any, values: dict[str, Any] | None = None):
    if not isinstance(message, str):
        return message
    result = message
    for key, value in (values or {}).items():
        result = result.replace("{" + str(key) + "}", str(value))
    return result


def translate_message(key: str, locale: str | None = None, default: str | None = None, **values):
    active_locale = resolve_locale(locale)
    message = _resolve_path(TRANSLATIONS.get(active_locale, {}), key)
    if message is None:
        message = _resolve_path(TRANSLATIONS.get("en-US", {}), key)
    if message is None:
        message = default or key
    return _format_message(message, values)


def get_locale_context(locale: str | None = None, request: Request | None = None):
    active_locale = resolve_request_locale(request, locale)
    active_translations = TRANSLATIONS.get(active_locale, TRANSLATIONS.get("en-US", {}))
    return {
        "language": active_translations.get("language", DEFAULT_LANGUAGE),
        "locale": active_locale,
        "supported_locales": SUPPORTED_LOCALES,
        "default_locale": DEFAULT_LOCALE,
        "is_rtl": active_locale in RTL_LOCALES,
        "translations": active_translations,
        "error_messages": active_translations.get("errors", {})
    }


def get_error_message(key: str, locale: str | None = None):
    return translate_message(key, locale)
