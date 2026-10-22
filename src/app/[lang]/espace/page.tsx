import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/project-card";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate, formatTND } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { signOut } from "@/lib/actions/auth";
import { withdrawIntent } from "@/lib/actions/intents";
import { getCurrentUser, getInvestorProfile, getMyIntents } from "@/lib/auth";
import { localizeProject, type KycStatus } from "@/lib/domain";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.dashboard.metaTitle };
}

export default async function DashboardPage(props: PageProps<"/[lang]/espace">) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sand-100" />}>
        <Dashboard searchParams={props.searchParams} t={t} locale={locale} />
      </Suspense>
    </main>
  );
}

const KYC_TONES: Record<KycStatus, string> = {
  incomplete: "border-amber-700/20 bg-amber-50 text-amber-700",
  pending_review: "border-azur-500/20 bg-azur-50 text-azur-700",
  verified: "border-olive-600/20 bg-olive-50 text-olive-600",
  rejected: "border-terra-500/20 bg-terra-50 text-terra-600",
};

async function Dashboard({
  searchParams,
  t,
  locale,
}: Pick<PageProps<"/[lang]/espace">, "searchParams"> & { t: Dictionary; locale: Locale }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/connexion?next=/${locale}/espace`);

  const [profile, myIntents, { profil }] = await Promise.all([getInvestorProfile(), getMyIntents(), searchParams]);
  const intents = myIntents.map((intent) => ({ ...intent, project: localizeProject(intent.project, locale) }));
  const kyc = profile?.kyc_status ?? "incomplete";
  const total = intents.reduce((sum, intent) => sum + intent.amount, 0);
  const firstName = profile?.full_name.split(" ")[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted" dir="ltr">
            {user.email}
          </p>
          <h1 className="font-display text-4xl font-semibold text-azur-900">
            {firstName ? fill(t.dashboard.hello, { name: firstName }) : t.dashboard.helloAnonymous}
          </h1>
        </div>
        <form action={signOut}>
          <input type="hidden" name="lang" value={locale} />
          <button type="submit" className="text-sm font-medium text-ink-soft hover:text-terra-600">
            {t.dashboard.signOut}
          </button>
        </form>
      </header>

      {profil === "enregistre" ? (
        <p role="status" className="rounded-xl border border-olive-600/30 bg-olive-50 px-4 py-3 text-sm text-olive-600">
          {t.dashboard.profileSaved}
        </p>
      ) : null}

      <section className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${KYC_TONES[kyc]}`}>
        <div>
          <p className="font-semibold">{t.labels.kyc[kyc].label}</p>
          <p className="text-sm opacity-90">{t.labels.kyc[kyc].description}</p>
        </div>
        <Link href={`/${locale}/espace/profil`} className={kyc === "incomplete" ? buttonClass : secondaryButtonClass}>
          {kyc === "incomplete" ? t.dashboard.completeProfile : t.dashboard.editProfile}
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold text-ink">{t.dashboard.intentsTitle}</h2>
          {intents.length > 0 ? (
            <p className="text-sm text-muted">{fill(t.dashboard.total, { amount: formatTND(total, locale) })}</p>
          ) : null}
        </div>

        {intents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center">
            <p className="text-ink-soft">{t.dashboard.empty}</p>
            <Link href={`/${locale}/projets`} className={`${buttonClass} mt-4`}>
              {t.dashboard.discover}
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
            {intents.map((intent) => (
              <li key={intent.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="space-y-1">
                  <Link
                    href={`/${locale}/projets/${intent.project.slug}`}
                    className="font-semibold text-ink hover:text-azur-700"
                  >
                    {intent.project.title}
                  </Link>
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    <StatusBadge status={intent.project.status} label={t.labels.statuses[intent.project.status]} />
                    {fill(t.dashboard.declaredOn, {
                      city: intent.project.city,
                      date: formatDate(intent.created_at, locale),
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-xl font-semibold text-azur-900">{formatTND(intent.amount, locale)}</p>
                  <form action={withdrawIntent}>
                    <input type="hidden" name="project_id" value={intent.project.id} />
                    <button type="submit" className="text-sm font-medium text-terra-600 hover:underline">
                      {t.dashboard.withdraw}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted">{t.dashboard.note}</p>
      </section>
    </div>
  );
}
