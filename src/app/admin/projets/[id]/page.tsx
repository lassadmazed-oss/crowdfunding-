import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { StatusBadge } from "@/components/project-card";
import { deleteProject } from "@/lib/actions/admin";
import { getAdminProject, getProjectIntents, requireAdmin } from "@/lib/admin";
import { formatTND, labels } from "../../admin-i18n";
import { EmptyRow, KycBadge, Table, TableSkeleton, formatDateTime } from "../../admin-ui";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Modifier le projet" };

export default function EditProjectPage(props: PageProps<"/admin/projets/[id]">) {
  return (
    <>
      <Link href="/admin/projets" className="text-sm font-medium text-azur-700">
        ← Projets
      </Link>
      <Suspense fallback={<TableSkeleton />}>
        <EditProject params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function EditProject({ params, searchParams }: Pick<PageProps<"/admin/projets/[id]">, "params" | "searchParams">) {
  await requireAdmin();
  const [{ id }, { cree }] = await Promise.all([params, searchParams]);
  const project = await getAdminProject(id);
  if (!project) notFound();
  const intents = await getProjectIntents(project.id);
  const total = intents.reduce((sum, intent) => sum + intent.amount, 0);

  return (
    <div className="space-y-8">
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-azur-900">{project.title}</h1>
          <p className="mt-2 flex items-center gap-3 text-sm text-muted">
            <StatusBadge status={project.status} label={labels.statuses[project.status]} />
            Modifié le {formatDateTime(project.updated_at)}
          </p>
        </div>
        {project.status !== "draft" ? (
          <Link href={`/fr/projets/${project.slug}`} target="_blank" className="text-sm font-medium text-azur-700">
            Voir sur le site ↗
          </Link>
        ) : null}
      </div>

      {cree ? (
        <p role="status" className="rounded-xl border border-olive-600/30 bg-olive-50 px-4 py-3 text-sm text-olive-600">
          Projet créé. Passez-le en « Bientôt » ou « Intentions ouvertes » pour le publier.
        </p>
      ) : null}

      <ProjectForm project={project} />

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Intentions <span className="text-base font-normal text-muted">· {formatTND(total)} au total</span>
        </h2>
        <Table head={["Investisseur", "Statut KYC", "Montant", "Déclarée le"]}>
          {intents.length === 0 ? (
            <EmptyRow colSpan={4}>Aucune intention sur ce projet.</EmptyRow>
          ) : (
            intents.map((intent) => (
              <tr key={intent.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/investisseurs/${intent.investor.id}`} className="font-medium hover:text-azur-700">
                    {intent.investor.full_name || "Sans nom"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <KycBadge status={intent.investor.kyc_status} />
                </td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatTND(intent.amount)}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap text-muted">{formatDateTime(intent.created_at)}</td>
              </tr>
            ))
          )}
        </Table>
      </section>

      <section className="rounded-2xl border border-terra-100 bg-terra-50/50 p-5">
        <h2 className="font-semibold text-ink">Supprimer le projet</h2>
        {intents.length > 0 ? (
          <p className="mt-1 text-sm text-ink-soft">
            Ce projet a des intentions déclarées : passez-le en « Clôturé » au lieu de le supprimer, pour garder
            l&apos;historique des investisseurs.
          </p>
        ) : (
          <form action={deleteProject} className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">La suppression est définitive.</p>
            <input type="hidden" name="id" value={project.id} />
            <ConfirmButton
              message={`Supprimer définitivement « ${project.title} » ?`}
              className="rounded-xl border border-terra-500 px-4 py-2 text-sm font-semibold text-terra-600 hover:bg-terra-500 hover:text-white"
            >
              Supprimer
            </ConfirmButton>
          </form>
        )}
      </section>
    </div>
  );
}
