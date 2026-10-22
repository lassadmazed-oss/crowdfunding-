import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/i18n/config";
import { loadDictionary } from "@/i18n/dictionaries";

// Server Components read the locale from the /[lang] root segment, no prop drilling needed.
// (Server Actions can't use root params: they get the locale from a hidden form field instead.)

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getDictionary() {
  return loadDictionary(await getLocale());
}
