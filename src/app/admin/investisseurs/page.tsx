import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAdminInvestors, requireAdmin } from "@/lib/admin";
import { KYC_STATUSES, isOneOf, labelFor, type KycStatus } from "@/lib/domain";
import { formatTND, labels } from "../admin-i18n";
import { EmptyRow, KycBadge, PageTitle, Table, TableSkeleton, formatDateTime } from "../admin-ui";

export const metadata: Metadata = { title: "Investisseurs" };

const TABS: { key: KycStatus | "tous"; label: string }[] = [
  { key: "pending_review", label: "À vérifier" },
  { key: "verified", label: "Validés" },
  { key: "rejected", label: "Refusés" },
  { key: "incomplete", label: "Incomplets" },
  { key: "tous", label: "Tous" },
];

export default function InvestorsPage(props: PageProps<"/admin/investisseurs">) {
  return (
    <>
      <PageTitle title="Investisseurs" description="Validez les questionnaires après vérification de l'identité." />
      <Suspense fallback={<TableSkeleton />}>
        <InvestorsTable searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function InvestorsTable({ searchParams }: Pick<PageProps<"/admin/investisseurs">, "searchParams">) {
  await requireAdmin();
  const { statut } = await searchParams;
  const active = statut === "tous" ? "tous" : isOneOf(statut, KYC_STATUSES) ? statut : "pending_review";
  const all = await getAdminInvestors();

  const counts = Object.fromEntries(TABS.map((tab) => [tab.key, 0])) as Record<KycStatus | "tous", number>;
  for (const investor of all) counts[investor.kyc_status] += 1;
  counts.tous = all.length;

  // Oldest submissions first in the review queue, newest accounts first elsewhere.
  const visible =
    active === "pending_review"
      ? all.filter((investor) => investor.kyc_status === active).toSorted((a, b) => a.updated_at.localeCompare(b.updated_at))
      : all.filter((investor) => active === "tous" || investor.kyc_status === active);

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par statut">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "pending_review" ? "/admin/investisseurs" : `/admin/investisseurs?statut=${tab.key}`}
            aria-current={active === tab.key ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              active === tab.key
                ? "border-azur-700 bg-azur-700 text-white"
                : "border-sand-300 bg-white text-ink-soft hover:border-azur-500"
            }`}
          >
            {tab.label} <span className="opacity-70">({counts[tab.key]})</span>
          </Link>
        ))}
      </nav>

      <Table head={["Investisseur", "Résidence", "Statut", "Intentions", active === "pending_review" ? "Soumis le" : "Inscrit le"]}>
        {visible.length === 0 ? (
          <EmptyRow colSpan={5}>
            {active === "pending_review" ? "Aucun questionnaire à vérifier." : "Aucun investisseur dans cette catégorie."}
          </EmptyRow>
        ) : (
          visible.map((investor) => (
            <tr key={investor.id} className="hover:bg-sand-50">
              <td className="px-4 py-3">
                <Link href={`/admin/investisseurs/${investor.id}`} className="font-medium text-ink hover:text-azur-700">
                  {investor.full_name || "Sans nom"}
                </Link>
                <span className="block text-xs text-muted">{investor.email}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                {investor.residency === "non_resident" ? labelFor(labels.countries, investor.country) : investor.residency ? "Tunisie" : "—"}
              </td>
              <td className="px-4 py-3">
                <KycBadge status={investor.kyc_status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {investor.intents_count > 0 ? `${formatTND(investor.intents_total)} (${investor.intents_count})` : "—"}
              </td>
              <td className="px-4 py-3 text-xs whitespace-nowrap text-muted">
                {formatDateTime(active === "pending_review" ? investor.updated_at : investor.created_at)}
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
