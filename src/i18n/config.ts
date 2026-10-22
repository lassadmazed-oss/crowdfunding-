// Supported languages. Safe to import anywhere (proxy, client and server components).

export const LOCALES = ["ar", "fr", "en", "de", "it"] as const;
export type Locale = (typeof LOCALES)[number];

// Used when neither the cookie nor the browser's languages match a supported locale.
export const DEFAULT_LOCALE: Locale = "fr";

// Project texts stored in the base columns are written in this language; others live in `translations`.
export const CONTENT_LOCALE: Locale = "fr";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_INFO: Record<Locale, { name: string; dir: "ltr" | "rtl"; intl: string; currency: string }> = {
  ar: { name: "العربية", dir: "rtl", intl: "ar-TN", currency: "د.ت" },
  fr: { name: "Français", dir: "ltr", intl: "fr-FR", currency: "DT" },
  en: { name: "English", dir: "ltr", intl: "en-GB", currency: "TND" },
  de: { name: "Deutsch", dir: "ltr", intl: "de-DE", currency: "TND" },
  it: { name: "Italiano", dir: "ltr", intl: "it-IT", currency: "TND" },
};

export function hasLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// Picks the best supported locale from an Accept-Language header, e.g. "de-CH,de;q=0.9,en;q=0.8".
export function matchLocale(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return { language: tag.toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.map((entry) => entry.language).find(hasLocale) ?? null;
}

// "/fr/projets" -> "/ar/projets": swaps (or adds) the locale prefix of a path.
export function withLocale(path: string, locale: Locale) {
  const segments = path.split("/");
  if (hasLocale(segments[1])) segments[1] = locale;
  else segments.splice(1, 0, locale);
  return segments.join("/").replace(/\/$/, "") || `/${locale}`;
}
