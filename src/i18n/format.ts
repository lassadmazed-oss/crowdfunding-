import { LOCALE_INFO, type Locale } from "@/i18n/config";

// Locale-aware formatting helpers. Plain functions, usable on the server and in client components.

export type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

// Declares a plural message; the keys follow Intl.PluralRules (Arabic uses zero/one/two/few/many/other).
export function plural(forms: Plural): Plural {
  return forms;
}

// Replaces {name} placeholders: fill("Bonjour {name}", { name: "Saif" }).
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function pluralize(forms: Plural, count: number, locale: Locale) {
  const category = new Intl.PluralRules(LOCALE_INFO[locale].intl).select(count);
  return fill(forms[category] ?? forms.other, { n: formatNumber(count, locale) });
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(LOCALE_INFO[locale].intl, { maximumFractionDigits: 2 }).format(value);
}

export function formatTND(amount: number, locale: Locale) {
  const number = new Intl.NumberFormat(LOCALE_INFO[locale].intl, { maximumFractionDigits: 0 }).format(amount);
  return `${number} ${LOCALE_INFO[locale].currency}`;
}

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].intl, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export function formatDuration(months: number, locale: Locale, forms: { months: Plural; years: Plural }) {
  return months % 12 === 0 ? pluralize(forms.years, months / 12, locale) : pluralize(forms.months, months, locale);
}
