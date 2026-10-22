import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/server";
import { SignupForm } from "./signup-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.signup.metaTitle };
}

export default async function SignupPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <h1 className="font-display text-4xl font-semibold text-azur-900">{t.signup.title}</h1>
        <p className="text-ink-soft">{t.signup.intro}</p>
        <ol className="space-y-3 text-sm text-ink-soft">
          {t.signup.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-terra-500 text-xs font-semibold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
        <SignupForm locale={locale} t={t.signup} />
        <p className="mt-6 text-center text-sm text-muted">
          {t.signup.already}{" "}
          <Link href={`/${locale}/connexion`} className="font-semibold text-azur-700 hover:text-azur-800">
            {t.signup.loginLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
