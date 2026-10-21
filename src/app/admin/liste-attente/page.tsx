import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { inputClass, secondaryButtonClass } from "@/components/ui";
import { deleteWaitlistEntry } from "@/lib/actions/admin";
import { WAITLIST_PAGE_SIZE, getWaitlist, requireAdmin } from "@/lib/admin";
import { COUNTRIES, MODELS, TICKET_RANGES, isOneOf, labelOf, type ProjectModel } from "@/lib/domain";
import { EmptyRow, PageTitle, Table, TableSkeleton, formatDateTime } from "../admin-ui";

export const metadata: Metadata = { title: "Liste d'attente" };

export default function WaitlistPage(props: PageProps<"/admin/liste-attente">) {
  return (
    <>
      <PageTitle
        title="Liste d'attente"
        description="Personnes inscrites depuis la page d'accueil."
        action={
          <a href="/admin/liste-attente/export" className={secondaryButtonClass}>
            Exporter en CSV
          </a>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <WaitlistTable searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function WaitlistTable({ searchParams }: Pick<PageProps<"/admin/liste-attente">, "searchParams">) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const residency = isOneOf(params.residence, ["resident", "non_resident"] as const) ? params.residence : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const { entries, total } = await getWaitlist({ q, residency, page });
  const pages = Math.max(1, Math.ceil(total / WAITLIST_PAGE_SIZE));

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (residency) query.set("residence", residency);
    if (target > 1) query.set("page", String(target));
    const text = query.toString();
    return `/admin/liste-attente${text ? `?${text}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-end gap-3" role="search">
        <label className="min-w-56 flex-1 space-y-1.5">
          <span className="block text-sm font-medium text-ink">Rechercher</span>
          <input name="q" defaultValue={q} placeholder="E-mail ou nom" className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-ink">Résidence</span>
          <select name="residence" defaultValue={residency ?? ""} className={inputClass}>
            <option value="">Toutes</option>
            <option value="resident">En Tunisie</option>
            <option value="non_resident">À l&apos;étranger</option>
          </select>
        </label>
        <button type="submit" className={secondaryButtonClass}>
          Filtrer
        </button>
      </form>

      <p className="text-sm text-muted">
        {total.toLocaleString("fr-FR")} inscrit{total > 1 ? "s" : ""}
        {q || residency ? " correspondant aux filtres" : ""}
      </p>

      <Table head={["E-mail", "Résidence", "Montant envisagé", "Intérêts", "Inscrit le", ""]}>
        {entries.length === 0 ? (
          <EmptyRow colSpan={6}>Aucune inscription{q || residency ? " ne correspond à ces filtres" : " pour le moment"}.</EmptyRow>
        ) : (
          entries.map((entry) => (
            <tr key={entry.id} className="align-top hover:bg-sand-50">
              <td className="px-4 py-3">
                <a href={`mailto:${entry.email}`} className="font-medium text-ink hover:text-azur-700">
                  {entry.email}
                </a>
                {entry.full_name ? <span className="block text-xs text-muted">{entry.full_name}</span> : null}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                {entry.residency === "resident" ? "Tunisie" : labelOf(COUNTRIES, entry.country)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                {entry.ticket_range ? labelOf(TICKET_RANGES, entry.ticket_range) : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-ink-soft">
                {entry.interests.length > 0
                  ? entry.interests.map((model) => MODELS[model as ProjectModel]?.label ?? model).join(", ")
                  : "—"}
              </td>
              <td className="px-4 py-3 text-xs whitespace-nowrap text-muted">{formatDateTime(entry.created_at)}</td>
              <td className="px-4 py-3 text-right">
                <form action={deleteWaitlistEntry}>
                  <input type="hidden" name="id" value={entry.id} />
                  <ConfirmButton message={`Retirer ${entry.email} de la liste d'attente ?`} className="text-xs font-medium text-terra-600 hover:underline">
                    Retirer
                  </ConfirmButton>
                </form>
              </td>
            </tr>
          ))
        )}
      </Table>

      {pages > 1 ? (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="font-medium text-azur-700">
              ← Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} sur {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className="font-medium text-azur-700">
              Suivant →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
