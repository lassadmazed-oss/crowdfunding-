import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/project-card";
import { buttonClass } from "@/components/ui";
import { getAdminProjects, requireAdmin } from "@/lib/admin";
import { getProjectInterest } from "@/lib/data";
import { formatTND, labels } from "../admin-i18n";
import { EmptyRow, PageTitle, Table, TableSkeleton, formatDateTime } from "../admin-ui";

export const metadata: Metadata = { title: "Projets" };

export default function AdminProjectsPage() {
  return (
    <>
      <PageTitle
        title="Projets"
        description="Les brouillons ne sont visibles que dans le back-office."
        action={
          <Link href="/admin/projets/nouveau" className={buttonClass}>
            + Nouveau projet
          </Link>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <ProjectsTable />
      </Suspense>
    </>
  );
}

async function ProjectsTable() {
  await requireAdmin();
  const [projects, interest] = await Promise.all([getAdminProjects(), getProjectInterest()]);

  return (
    <Table head={["Projet", "Type", "Statut", "Objectif", "Intentions", "Modifié"]}>
      {projects.length === 0 ? (
        <EmptyRow colSpan={6}>Aucun projet. Créez le premier.</EmptyRow>
      ) : (
        projects.map((project) => {
          const stats = interest[project.id];
          return (
            <tr key={project.id} className="hover:bg-sand-50">
              <td className="px-4 py-3">
                <Link href={`/admin/projets/${project.id}`} className="font-medium text-ink hover:text-azur-700">
                  {project.title}
                </Link>
                <span className="block text-xs text-muted">
                  {project.city}
                  {project.is_demo ? " · exemple" : ""}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-soft">{labels.models[project.model].label}</td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status} label={labels.statuses[project.status]} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatTND(project.target_amount)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {stats ? `${formatTND(stats.totalAmount)} (${stats.investorCount})` : "—"}
              </td>
              <td className="px-4 py-3 text-xs whitespace-nowrap text-muted">{formatDateTime(project.updated_at)}</td>
            </tr>
          );
        })
      )}
    </Table>
  );
}
