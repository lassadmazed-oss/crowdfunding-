import "server-only";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "./fr";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import("./ar").then((module) => module.default),
  fr: () => import("./fr").then((module) => module.default),
  en: () => import("./en").then((module) => module.default),
  de: () => import("./de").then((module) => module.default),
  it: () => import("./it").then((module) => module.default),
};

// For Server Actions and Route Handlers, which receive the locale explicitly.
export function loadDictionary(locale: Locale) {
  return loaders[locale]();
}

export type { Dictionary };
