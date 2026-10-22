import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getDictionary, getLocale } from "@/i18n/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.login.metaTitle };
}

export default async function LoginPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-azur-900">{t.login.title}</h1>
        <p className="mt-2 text-sm text-ink-soft">{t.login.intro}</p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-sand-100" />}>
            <LoginForm locale={locale} t={t.login} />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          {t.login.noAccount}{" "}
          <Link href={`/${locale}/inscription`} className="font-semibold text-azur-700 hover:text-azur-800">
            {t.login.signupLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
