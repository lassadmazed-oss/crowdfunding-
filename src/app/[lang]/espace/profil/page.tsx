import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getDictionary, getLocale } from "@/i18n/server";
import { getCurrentUser, getInvestorProfile } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.profile.metaTitle };
}

export default async function ProfilePage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href={`/${locale}/espace`} className="text-sm font-medium text-azur-700 hover:text-azur-800">
        {t.profile.back}
      </Link>
      <h1 className="mt-4 font-display text-4xl font-semibold text-azur-900">{t.profile.title}</h1>
      <p className="mt-3 text-ink-soft">{t.profile.intro}</p>
      <Suspense fallback={<div className="mt-8 h-[40rem] animate-pulse rounded-3xl bg-sand-100" />}>
        <ProfileSection t={t} locale={locale} />
      </Suspense>
    </main>
  );
}

async function ProfileSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/connexion?next=/${locale}/espace/profil`);

  const profile = await getInvestorProfile();
  if (!profile) redirect(`/${locale}/espace`);

  return <ProfileForm profile={profile} locale={locale} t={t.profile} labels={t.labels} />;
}
