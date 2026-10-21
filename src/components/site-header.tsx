import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/80 bg-sand-50/90 backdrop-blur">
      <ComplianceBanner />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-sm font-medium text-ink-soft sm:gap-2">
          <Link href="/projets" className="hidden rounded-lg px-3 py-2 hover:bg-sand-100 hover:text-ink sm:block">
            Projets
          </Link>
          <Link href="/#fonctionnement" className="hidden rounded-lg px-3 py-2 hover:bg-sand-100 hover:text-ink md:block">
            Comment ça marche
          </Link>
          <Suspense fallback={<div className="h-9 w-28 animate-pulse rounded-lg bg-sand-100" />}>
            <UserNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function UserNav() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <>
        {(await isAdmin()) ? (
          <Link href="/admin" className="rounded-lg px-3 py-2 text-terra-600 hover:bg-terra-50">
            Admin
          </Link>
        ) : null}
        <Link
        href="/espace"
        className="flex items-center gap-2 rounded-lg bg-azur-700 px-3 py-2 text-white hover:bg-azur-800"
      >
        <span className="grid size-5 place-items-center rounded-full bg-white/20 text-xs font-semibold uppercase">
          {user.email.charAt(0) || "?"}
        </span>
          Mon espace
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/connexion" className="rounded-lg px-3 py-2 hover:bg-sand-100 hover:text-ink">
        Connexion
      </Link>
      <Link href="/inscription" className="rounded-lg bg-azur-700 px-3 py-2 text-white hover:bg-azur-800">
        <span className="sm:hidden">S&apos;inscrire</span>
        <span className="hidden sm:inline">Créer un compte</span>
      </Link>
    </>
  );
}

function ComplianceBanner() {
  return (
    <p className="bg-azur-900 px-4 py-1.5 text-center text-xs leading-relaxed text-azur-100">
      Lebna est en cours de lancement : aucune somme n&apos;est collectée avant l&apos;agrément du Conseil du marché
      financier. Les intentions d&apos;investissement sont non engageantes.
    </p>
  );
}
