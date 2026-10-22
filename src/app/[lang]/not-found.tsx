import Link from "next/link";
import { BrickMark } from "@/components/brand";
import { buttonClass } from "@/components/ui";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function NotFound() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <BrickMark className="size-14" />
      <h1 className="mt-6 font-display text-4xl font-semibold text-azur-900">{t.notFound.title}</h1>
      <p className="mt-3 text-ink-soft">{t.notFound.text}</p>
      <Link href={`/${locale}/projets`} className={`${buttonClass} mt-8`}>
        {t.notFound.cta}
      </Link>
    </main>
  );
}
