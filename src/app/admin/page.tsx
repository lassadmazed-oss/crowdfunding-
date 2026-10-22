import Link from "next/link";
import { Suspense } from "react";
import { getAdminInvestors, getAdminStats, getWaitlist, requireAdmin } from "@/lib/admin";
import { labelFor } from "@/lib/domain";
import { formatTND, labels } from "./admin-i18n";
import { PageTitle, TableSkeleton, formatDateTime } from "./admin-ui";

export default function AdminDashboardPage() {
  return (
    <>
      <PageTitle title="Tableau de bord" description="Vue d'ensemble de la plateforme." />
      <Suspense fallback={<TableSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await requireAdmin();
  const [stats, pending, waitlist] = await Promise.all([
    getAdminStats(),
    getAdminInvestors("pending_review"),
    getWaitlist({ page: 1 }),
  ]);

  const cards = [
    {
      label: "Liste d'attente",
      value: stats.waitlist.total.toLocaleString("fr-FR"),
      detail: `${stats.waitlist.lastWeek} cette semaine · ${stats.waitlist.abroad} à l'étranger`,
      href: "/admin/liste-attente",
    },
    {
      label: "Investisseurs",
      value: stats.investors.total.toLocaleString("fr-FR"),
      detail: `${stats.investors.verified} validés · ${stats.investors.incomplete} profils incomplets`,
      href: "/admin/investisseurs?statut=tous",
    },
    {
      label: "À vérifier",
      value: stats.investors.pending_review.toLocaleString("fr-FR"),
      detail: "Questionnaires en attente de validation",
      href: "/admin/investisseurs",
      highlight: stats.investors.pending_review > 0,
    },
    {
      label: "Intentions déclarées",
      value: formatTND(stats.intents.total),
      detail: `${stats.intents.count} intention${stats.intents.count > 1 ? "s" : ""} · ${stats.projects.published} projets publiés, ${stats.projects.drafts} brouillons`,
      href: "/admin/projets",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-2xl border p-5 transition hover:shadow-md ${
              card.highlight ? "border-amber-700/30 bg-amber-50" : "border-sand-200 bg-white"
            }`}
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-azur-900">{card.value}</p>
            <p className="mt-2 text-xs text-muted">{card.detail}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-sand-200 bg-white p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold text-ink">Profils à vérifier</h2>
            <Link href="/admin/investisseurs" className="text-sm font-medium text-azur-700">
              Tout voir →
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Aucun profil en attente.</p>
          ) : (
            <ul className="divide-y divide-sand-200">
              {pending
                .toSorted((a, b) => a.updated_at.localeCompare(b.updated_at))
                .slice(0, 6)
                .map((investor) => (
                  <li key={investor.id}>
                    <Link href={`/admin/investisseurs/${investor.id}`} className="flex justify-between gap-4 py-3 hover:text-azur-700">
                      <span>
                        <span className="block font-medium">{investor.full_name || investor.email}</span>
                        <span className="block text-xs text-muted">{investor.email}</span>
                      </span>
                      <span className="text-xs whitespace-nowrap text-muted">{formatDateTime(investor.updated_at)}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-sand-200 bg-white p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold text-ink">Dernières inscriptions à la liste</h2>
            <Link href="/admin/liste-attente" className="text-sm font-medium text-azur-700">
              Tout voir →
            </Link>
          </div>
          {waitlist.entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Personne pour le moment.</p>
          ) : (
            <ul className="divide-y divide-sand-200">
              {waitlist.entries.slice(0, 6).map((entry) => (
                <li key={entry.id} className="flex justify-between gap-4 py-3">
                  <span>
                    <span className="block font-medium text-ink">{entry.email}</span>
                    <span className="block text-xs text-muted">
                      {labelFor(labels.countries, entry.country)}
                      {entry.full_name ? ` · ${entry.full_name}` : ""}
                    </span>
                  </span>
                  <span className="text-xs whitespace-nowrap text-muted">{formatDateTime(entry.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
