import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand";
import { LanguageMenu, LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getDictionary, getLocale } from "@/i18n/server";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/80 bg-sand-50/90 backdrop-blur">
      <p className="bg-azur-900 px-4 py-1.5 text-center text-xs leading-relaxed text-azur-100">{t.header.banner}</p>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo href={`/${locale}`} label={t.common.homeLabel} />
        <nav className="flex items-center gap-1 text-sm font-medium text-ink-soft sm:gap-2">
          <Link href={`/${locale}/projets`} className="hidden rounded-lg px-3 py-2 hover:bg-sand-100 hover:text-ink sm:block">
            {t.header.projects}
          </Link>
          <Link
            href={`/${locale}#fonctionnement`}
            className="hidden rounded-lg px-3 py-2 hover:bg-sand-100 hover:text-ink md:block"
          >
            {t.header.howItWorks}
          </Link>
          <Suspense fallback={<LanguageMenu current={locale} label={t.common.language} path={null} />}>
            <LanguageSwitcher current={locale} label={t.common.language} />
          </Suspense>
          <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-lg bg-sand-100" />}>
            <UserNav t={t} locale={locale} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function UserNav({ t, locale }: { t: Dictionary; locale: Locale }) {
  const user = await getCurrentUser();

  if (user) {
    return (
      <>
        {(await isAdmin()) ? (
          <Link href="/admin" className="rounded-lg px-3 py-2 text-terra-600 hover:bg-terra-50">
            {t.header.admin}
          </Link>
        ) : null}
        <Link
          href={`/${locale}/espace`}
          className="flex items-center gap-2 rounded-lg bg-azur-700 px-3 py-2 whitespace-nowrap text-white hover:bg-azur-800"
        >
          <span className="grid size-5 place-items-center rounded-full bg-white/20 text-xs font-semibold uppercase">
            {user.email.charAt(0) || "?"}
          </span>
          {t.header.mySpace}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/${locale}/connexion`}
        className="rounded-lg px-2 py-2 whitespace-nowrap hover:bg-sand-100 hover:text-ink max-[359px]:hidden sm:px-3"
      >
        {t.header.login}
      </Link>
      <Link
        href={`/${locale}/inscription`}
        className="rounded-lg bg-azur-700 px-2.5 py-2 whitespace-nowrap text-white hover:bg-azur-800 sm:px-3"
      >
        <span className="sm:hidden">{t.header.signupShort}</span>
        <span className="hidden sm:inline">{t.header.signup}</span>
      </Link>
    </>
  );
}
