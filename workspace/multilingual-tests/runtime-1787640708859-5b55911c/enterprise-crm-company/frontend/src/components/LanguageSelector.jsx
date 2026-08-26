import { LOCALIZATION, useLocalization } from "../localization/index.js";

export function LanguageSelector() {
  const { currentLocale, supportedLocales, setLocale, getLocaleLabel } = useLocalization();

  return (
    <label className="language-selector">
      <span>{LOCALIZATION.frontend.language}</span>
      <select
        aria-label={LOCALIZATION.frontend.switchLanguage}
        value={currentLocale}
        onChange={(event) => setLocale(event.target.value)}
      >
        {supportedLocales.map((locale) => (
          <option key={locale} value={locale}>
            {getLocaleLabel(locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
