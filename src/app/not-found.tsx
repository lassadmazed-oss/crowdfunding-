import Link from "next/link";
import { BrickMark } from "@/components/brand";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <BrickMark className="size-14" />
      <h1 className="mt-6 font-display text-4xl font-semibold text-azur-900">Page introuvable</h1>
      <p className="mt-3 text-ink-soft">Il manque une brique : cette page n&apos;existe pas ou plus.</p>
      <Link href="/projets" className={`${buttonClass} mt-8`}>
        Voir les projets
      </Link>
    </main>
  );
}
