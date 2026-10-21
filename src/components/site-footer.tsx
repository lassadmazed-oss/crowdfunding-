import { cacheLife } from "next/cache";
import Link from "next/link";
import { Logo } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-sand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Financement participatif immobilier pour les Tunisiens, en Tunisie et à l&apos;étranger. Plateforme en
            cours de constitution, dans le cadre de la loi n° 2020-37 du 6 août 2020.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-ink">Plateforme</p>
          <Link href="/projets" className="block text-muted hover:text-ink">
            Projets
          </Link>
          <Link href="/#fonctionnement" className="block text-muted hover:text-ink">
            Comment ça marche
          </Link>
          <Link href="/#liste-attente" className="block text-muted hover:text-ink">
            Liste d&apos;attente
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-ink">Avertissement</p>
          <p className="leading-relaxed text-muted">
            Investir dans l&apos;immobilier comporte un risque de perte en capital et d&apos;illiquidité. Les
            rendements affichés sont des objectifs, non garantis.
          </p>
        </div>
      </div>
      <p className="border-t border-sand-200 py-4 text-center text-xs text-muted">
        © <CurrentYear /> Lebna · Tunis
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
