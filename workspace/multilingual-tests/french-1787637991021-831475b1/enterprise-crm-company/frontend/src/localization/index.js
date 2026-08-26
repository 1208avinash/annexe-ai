import { LOCALIZATION } from "./resources.js";

function resolvePath(source, keyPath, fallback) {
  return keyPath.split(".").reduce((current, key) => current?.[key], source) ?? fallback;
}

export { LOCALIZATION };

export function translate(keyPath, fallback = "") {
  return resolvePath(LOCALIZATION, keyPath, fallback);
}

export function formatLocalizedDate(value, options = {}) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat(LOCALIZATION.defaultLocale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options
  }).format(date);
}
