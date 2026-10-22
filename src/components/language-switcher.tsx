"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_INFO, withLocale, type Locale } from "@/i18n/config";

// Reading the path is runtime data: render <LanguageMenu path={null} /> as the Suspense fallback.
export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  return <LanguageMenu current={current} label={label} path={usePathname()} />;
}

export function LanguageMenu({ current, label, path }: { current: Locale; label: string; path: string | null }) {
  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-2 text-ink-soft hover:bg-sand-100 hover:text-ink [&::-webkit-details-marker]:hidden"
        aria-label={label}
      >
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M2.5 10h15M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.7-3-7.5s1-5.3 3-7.5z" />
        </svg>
        <span className="text-xs font-semibold uppercase">{current}</span>
      </summary>
      <ul className="absolute end-0 top-full z-40 mt-1 min-w-36 overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-lg">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              href={path ? withLocale(path, locale) : `/${locale}`}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? "true" : undefined}
              className={`flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-sand-50 ${
                locale === current ? "font-semibold text-azur-700" : "text-ink"
              }`}
            >
              {LOCALE_INFO[locale].name}
              <span className="text-xs text-muted uppercase">{locale}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
