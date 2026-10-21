import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/project-card";
import { getAdminInvestor, getInvestorIntents, requireAdmin } from "@/lib/admin";
import {
  ASSET_RANGES,
  COUNTRIES,
  EXPERIENCE_LEVELS,
  INCOME_RANGES,
  formatDate,
  formatTND,
  labelOf,
} from "@/lib/domain";
import { EmptyRow, KycBadge, Table, TableSkeleton, formatDateTime } from "../../admin-ui";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = { title: "Investisseur" };

export default function InvestorPage(props: PageProps<"/admin/investisseurs/[id]">) {
  return (
    <>
      <Link href="/admin/investisseurs" className="text-sm font-medium text-azur-700">
        ← Investisseurs
      </Link>
      <Suspense fallback={<TableSkeleton />}>
        <InvestorDetail params={props.params} />
      </Suspense>
    </>
  );
}

function ageFrom(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  if (now < new Date(Date.UTC(now.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()))) age -= 1;
  return age;
}

async function InvestorDetail({ params }: Pick<PageProps<"/admin/investisseurs/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const investor = await getAdminInvestor(id);
  if (!investor) notFound();
  const intents = await getInvestorIntents(investor.id);

  const facts = [
    { label: "E-mail", value: investor.email },
    { label: "Téléphone", value: investor.phone ?? "—" },
    {
      label: "Date de naissance",
      value: investor.birth_date ? `${formatDate(investor.birth_date)} (${ageFrom(investor.birth_date)} ans)` : "—",
    },
    { label: "Profession", value: investor.profession ?? "—" },
    {
      label: "Résidence",
      value: investor.residency === "non_resident" ? `Étranger · ${labelOf(COUNTRIES, investor.country)}` : investor.residency ? "Tunisie" : "—",
    },
    { label: "Ville", value: investor.city ?? "—" },
    { label: "Revenus annuels", value: labelOf(INCOME_RANGES, investor.annual_income_range) },
    { label: "Épargne disponible", value: labelOf(ASSET_RANGES, investor.investable_assets_range) },
    { label: "Expérience", value: labelOf(EXPERIENCE_LEVELS, investor.experience_level) },
    { label: "Préférence sukuk", value: investor.prefers_sukuk ? "Oui" : "Non" },
    {
      label: "Risques reconnus le",
      value: investor.risk_acknowledged_at ? formatDateTime(investor.risk_acknowledged_at) : "Non",
    },
    { label: "Compte créé le", value: formatDateTime(investor.created_at) },
  ];

  return (
    <div className="mt-2 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-semibold text-azur-900">{investor.full_name || "Sans nom"}</h1>
          <KycBadge status={investor.kyc_status} />
        </header>

        <dl className="grid gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-white p-4">
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className="mt-1 font-medium break-words text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Intentions <span className="text-base font-normal text-muted">· {formatTND(investor.intents_total)}</span>
          </h2>
          <Table head={["Projet", "Statut", "Montant", "Déclarée le"]}>
            {intents.length === 0 ? (
              <EmptyRow colSpan={4}>Aucune intention déclarée.</EmptyRow>
            ) : (
              intents.map((intent) => (
                <tr key={intent.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/projets/${intent.project.id}`} className="font-medium hover:text-azur-700">
                      {intent.project.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={intent.project.status} />
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatTND(intent.amount)}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-muted">{formatDateTime(intent.created_at)}</td>
                </tr>
              ))
            )}
          </Table>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-ink">Décision KYC</h2>
          {investor.kyc_reviewed_at ? (
            <p className="mt-2 text-sm text-muted">
              Dernière décision le {formatDateTime(investor.kyc_reviewed_at)}
              {investor.kyc_note ? (
                <span className="mt-1 block rounded-lg bg-sand-50 px-3 py-2 text-ink-soft">« {investor.kyc_note} »</span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-4">
            <ReviewForm investorId={investor.id} status={investor.kyc_status} />
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Validez seulement après avoir vérifié une pièce d&apos;identité. Si l&apos;investisseur modifie son identité
          après une décision, son profil repasse automatiquement en vérification.
        </p>
      </aside>
    </div>
  );
}
