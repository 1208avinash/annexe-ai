import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

import { LOCALIZATION as LOCALIZATION_RESOURCES } from "./resources.js";

const RAW_LOCALIZATION = JSON.parse(JSON.stringify(LOCALIZATION_RESOURCES));
const STORAGE_KEY = RAW_LOCALIZATION.storageKey ?? "annexe.locale";
const MEMORY_STORAGE = { value: null };
const LOCALE_LISTENERS = new Set();
const LocalizationContext = createContext(null);
const LOCALIZATION = {};

function normalizeLocale(locale) {
  if (!locale) {
    return null;
  }

  return String(locale).trim().replace(/_/g, "-");
}

function getSupportedLocales() {
  const locales = Array.isArray(RAW_LOCALIZATION.supportedLocales) && RAW_LOCALIZATION.supportedLocales.length
    ? RAW_LOCALIZATION.supportedLocales
    : ["en-US"];
  return Array.from(new Set(locales.map(normalizeLocale).filter(Boolean)));
}

function isRtlLocale(locale) {
  const normalized = normalizeLocale(locale);
  return (RAW_LOCALIZATION.rtlLocales ?? []).includes(normalized);
}

function getLocaleLabel(locale) {
  const normalized = normalizeLocale(locale);
  return RAW_LOCALIZATION.localeLabels?.[normalized] ?? normalized ?? "English";
}

function createPreferenceStore() {
  const canUseWindowStorage = typeof window !== "undefined" && window.localStorage;

  return {
    get() {
      if (canUseWindowStorage) {
        return window.localStorage.getItem(STORAGE_KEY);
      }
      return MEMORY_STORAGE.value;
    },
    set(value) {
      if (canUseWindowStorage) {
        window.localStorage.setItem(STORAGE_KEY, value);
        return;
      }
      MEMORY_STORAGE.value = value;
    },
    clear() {
      if (canUseWindowStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      MEMORY_STORAGE.value = null;
    }
  };
}

let preferenceStore = createPreferenceStore();
let currentLocale = resolveInitialLocale();

function getLocaleBundle(locale = currentLocale) {
  const normalized = resolveLocale(locale);
  return RAW_LOCALIZATION.translations?.[normalized] ?? RAW_LOCALIZATION.translations?.["en-US"] ?? RAW_LOCALIZATION;
}

function resolvePath(source, keyPath) {
  return String(keyPath)
    .split(".")
    .reduce((current, key) => current?.[key], source);
}

function formatTemplate(value, variables = {}) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/{([^}]+)}/g, (match, token) => {
    const replacement = variables[token.trim()];
    return replacement === undefined || replacement === null ? match : String(replacement);
  });
}

function resolveLocale(locale) {
  const normalized = normalizeLocale(locale);
  const supportedLocales = getSupportedLocales();

  if (normalized && supportedLocales.includes(normalized)) {
    return normalized;
  }

  if (normalized && normalized.includes("-")) {
    const languagePrefix = normalized.split("-")[0];
    const fallback = supportedLocales.find((candidate) => candidate.startsWith(languagePrefix + "-") || candidate === languagePrefix);
    if (fallback) {
      return fallback;
    }
  }

  const projectDefault = normalizeLocale(RAW_LOCALIZATION.projectDefaultLocale ?? RAW_LOCALIZATION.defaultLocale);
  if (projectDefault && supportedLocales.includes(projectDefault)) {
    return projectDefault;
  }

  const generatedDefault = normalizeLocale(RAW_LOCALIZATION.generatedApplicationDefaultLocale ?? projectDefault);
  if (generatedDefault && supportedLocales.includes(generatedDefault)) {
    return generatedDefault;
  }

  return supportedLocales.includes("en-US") ? "en-US" : (supportedLocales[0] ?? "en-US");
}

function resolveBrowserLocale() {
  if (typeof navigator === "undefined") {
    return null;
  }

  const candidates = [
    navigator.language,
    ...(Array.isArray(navigator.languages) ? navigator.languages : [])
  ].map(normalizeLocale).filter(Boolean);

  for (const candidate of candidates) {
    const resolved = resolveLocale(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

function resolveInitialLocale() {
  const stored = preferenceStore.get();
  if (stored) {
    return resolveLocale(stored);
  }

  const projectDefault = resolveLocale(RAW_LOCALIZATION.projectDefaultLocale ?? RAW_LOCALIZATION.defaultLocale);
  if (projectDefault) {
    return projectDefault;
  }

  const generatedDefault = resolveLocale(RAW_LOCALIZATION.generatedApplicationDefaultLocale);
  if (generatedDefault) {
    return generatedDefault;
  }

  const browserLocale = resolveBrowserLocale();
  if (browserLocale) {
    return browserLocale;
  }

  return "en-US";
}

function notifyLocaleChange(locale) {
  LOCALE_LISTENERS.forEach((listener) => {
    try {
      listener(locale);
    } catch {
      // Listener failures should not break locale switching.
    }
  });
}

function applyDocumentLocale(locale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
  document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr";
}

export function configureLocalePreferenceStore(adapter) {
  if (!adapter) {
    preferenceStore = createPreferenceStore();
    return preferenceStore;
  }

  preferenceStore = {
    get: typeof adapter.get === "function" ? () => adapter.get() : () => null,
    set: typeof adapter.set === "function" ? (value) => adapter.set(value) : () => {},
    clear: typeof adapter.clear === "function" ? () => adapter.clear() : () => {}
  };
  return preferenceStore;
}

export function getStoredLocalePreference() {
  return preferenceStore.get();
}

export function getCurrentLocale() {
  return currentLocale;
}

export function getLocaleDirection(locale = currentLocale) {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

export function setLocale(locale, options = {}) {
  const resolved = resolveLocale(locale);
  currentLocale = resolved;
  if (options.persist !== false) {
    preferenceStore.set(resolved);
  }
  applyDocumentLocale(resolved);
  notifyLocaleChange(resolved);
  return resolved;
}

export function subscribeLocale(listener) {
  LOCALE_LISTENERS.add(listener);
  return () => LOCALE_LISTENERS.delete(listener);
}

export function translate(keyPath, variables = {}, fallback = "") {
  const activeBundle = getLocaleBundle(currentLocale);
  const englishBundle = getLocaleBundle("en-US");
  const activeValue = resolvePath(activeBundle, keyPath);
  const fallbackValue = resolvePath(englishBundle, keyPath);
  const resolvedValue = activeValue ?? fallbackValue ?? fallback ?? keyPath;
  return formatTemplate(resolvedValue, variables);
}

export function formatLocalizedDate(value, options = {}) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat(getCurrentLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
    ...options
  }).format(date);
}

export function useLocalization() {
  const [locale, setLocaleState] = useState(() => getCurrentLocale());

  useEffect(() => subscribeLocale(setLocaleState), []);

  const bundle = getLocaleBundle(locale);

  return {
    locale,
    currentLocale: locale,
    supportedLocales: getSupportedLocales(),
    localeLabels: RAW_LOCALIZATION.localeLabels ?? {},
    rtlLocales: RAW_LOCALIZATION.rtlLocales ?? [],
    direction: getLocaleDirection(locale),
    translationReady: Boolean(bundle),
    setLocale,
    getCurrentLocale,
    getSupportedLocales,
    getLocaleLabel,
    getStoredLocalePreference,
    translate,
    formatLocalizedDate,
    isRtlLocale
  };
}

export function LocalizationProvider({ children }) {
  const [locale, setLocaleState] = useState(() => getCurrentLocale());

  useEffect(() => {
    applyDocumentLocale(locale);
    return subscribeLocale(setLocaleState);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    currentLocale: locale,
    supportedLocales: getSupportedLocales(),
    localeLabels: RAW_LOCALIZATION.localeLabels ?? {},
    rtlLocales: RAW_LOCALIZATION.rtlLocales ?? [],
    direction: getLocaleDirection(locale),
    setLocale,
    getCurrentLocale,
    getSupportedLocales,
    getLocaleLabel,
    getStoredLocalePreference,
    translate,
    formatLocalizedDate,
    isRtlLocale
  }), [locale]);

  return createElement(LocalizationContext.Provider, { value }, children);
}

export function useLocalizationContext() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalizationContext must be used within a LocalizationProvider");
  }
  return context;
}

const dynamicBundleKeys = [
  "language",
  "locale",
  "defaultLocale",
  "projectDefaultLocale",
  "organizationDefaultLocale",
  "generatedApplicationDefaultLocale",
  "direction",
  "supportedLocales",
  "runtimeSupportedLocales",
  "localeLabels",
  "rtlLocales",
  "storageKey",
  "uiLabels",
  "menuLabels",
  "errorMessages",
  "screens",
  "buttons",
  "frontend",
  "documentation",
  "translations"
];

for (const key of dynamicBundleKeys) {
  Object.defineProperty(LOCALIZATION, key, {
    get() {
      const bundle = getLocaleBundle(currentLocale);
      if (key === "translations" || key === "storageKey" || key === "rtlLocales" || key === "localeLabels") {
        return RAW_LOCALIZATION[key];
      }
      if (key === "supportedLocales" || key === "runtimeSupportedLocales") {
        return getSupportedLocales();
      }
      return bundle[key] ?? RAW_LOCALIZATION[key];
    },
    enumerable: true,
    configurable: true
  });
}

export { LOCALIZATION };
