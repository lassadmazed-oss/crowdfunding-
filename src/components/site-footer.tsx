import { cacheLife } from "next/cache";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { getDictionary, getLocale } from "@/i18n/server";

export async function SiteFooter() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <footer className="border-t border-sand-200 bg-sand-100 safe-bottom">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo href={`/${locale}`} label={t.common.homeLabel} />
          <p className="max-w-sm text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-ink">{t.footer.platform}</p>
          <Link href={`/${locale}/projets`} className="block text-muted hover:text-ink">
            {t.footer.projects}
          </Link>
          <Link href={`/${locale}#fonctionnement`} className="block text-muted hover:text-ink">
            {t.footer.howItWorks}
          </Link>
          <Link href={`/${locale}#liste-attente`} className="block text-muted hover:text-ink">
            {t.footer.waitlist}
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-ink">{t.footer.warningTitle}</p>
          <p className="leading-relaxed text-muted">{t.footer.warningText}</p>
        </div>
      </div>
      <p className="border-t border-sand-200 py-4 text-center text-xs text-muted">
        © <CurrentYear /> Lebna · {t.footer.city}
      </p>
    </footer>
  );
}

// Reading the clock must be cached for the footer to stay in the prerendered shell.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
