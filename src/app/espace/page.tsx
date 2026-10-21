import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/project-card";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import { withdrawIntent } from "@/lib/actions/intents";
import { signOut } from "@/lib/actions/auth";
import { getCurrentUser, getInvestorProfile, getMyIntents } from "@/lib/auth";
import { KYC, formatDate, formatTND, type KycStatus } from "@/lib/domain";

export const metadata: Metadata = { title: "Mon espace" };

export default function DashboardPage(props: PageProps<"/espace">) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sand-100" />}>
        <Dashboard searchParams={props.searchParams} />
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

async function Dashboard({ searchParams }: Pick<PageProps<"/espace">, "searchParams">) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/espace");

  const [profile, intents, { profil }] = await Promise.all([getInvestorProfile(), getMyIntents(), searchParams]);
  const kyc = profile?.kyc_status ?? "incomplete";
  const total = intents.reduce((sum, intent) => sum + intent.amount, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{user.email}</p>
          <h1 className="font-display text-4xl font-semibold text-azur-900">
            Bonjour{profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm font-medium text-ink-soft hover:text-terra-600">
            Se déconnecter
          </button>
        </form>
      </header>

      {profil === "enregistre" ? (
        <p role="status" className="rounded-xl border border-olive-600/30 bg-olive-50 px-4 py-3 text-sm text-olive-600">
          Votre profil investisseur a bien été enregistré.
        </p>
      ) : null}

      <section className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${KYC_TONES[kyc]}`}>
        <div>
          <p className="font-semibold">{KYC[kyc].label}</p>
          <p className="text-sm opacity-90">{KYC[kyc].description}</p>
        </div>
        <Link href="/espace/profil" className={kyc === "incomplete" ? buttonClass : secondaryButtonClass}>
          {kyc === "incomplete" ? "Compléter mon profil" : "Modifier mon profil"}
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold text-ink">Mes intentions</h2>
          {intents.length > 0 ? (
            <p className="text-sm text-muted">
              Total déclaré : <strong className="text-ink">{formatTND(total)}</strong>
            </p>
          ) : null}
        </div>

        {intents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center">
            <p className="text-ink-soft">Vous n&apos;avez encore déclaré aucune intention.</p>
            <Link href="/projets" className={`${buttonClass} mt-4`}>
              Découvrir les projets
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
            {intents.map((intent) => (
              <li key={intent.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="space-y-1">
                  <Link href={`/projets/${intent.project.slug}`} className="font-semibold text-ink hover:text-azur-700">
                    {intent.project.title}
                  </Link>
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    <StatusBadge status={intent.project.status} />
                    {intent.project.city} · déclarée le {formatDate(intent.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-xl font-semibold text-azur-900">{formatTND(intent.amount)}</p>
                  <form action={withdrawIntent}>
                    <input type="hidden" name="project_id" value={intent.project.id} />
                    <button type="submit" className="text-sm font-medium text-terra-600 hover:underline">
                      Retirer
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted">
          Ces intentions sont non engageantes. Nous vous contacterons avant toute ouverture effective d&apos;un projet.
        </p>
      </section>
    </div>
  );
}
