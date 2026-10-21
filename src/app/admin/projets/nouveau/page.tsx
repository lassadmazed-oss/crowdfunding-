import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";
import { PageTitle, TableSkeleton } from "../../admin-ui";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Nouveau projet" };

export default function NewProjectPage() {
  return (
    <>
      <Link href="/admin/projets" className="text-sm font-medium text-azur-700">
        ← Projets
      </Link>
      <PageTitle title="Nouveau projet" description="Enregistré en brouillon par défaut : invisible sur le site." />
      <Suspense fallback={<TableSkeleton />}>
        <AdminOnlyForm />
      </Suspense>
    </>
  );
}

async function AdminOnlyForm() {
  await requireAdmin();
  return <ProjectForm />;
}
