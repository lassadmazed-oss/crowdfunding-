import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectCard } from "@/components/project-card";
import { getProjectInterest, getPublishedProjects } from "@/lib/data";
import { MODELS, MODEL_ORDER, isOneOf } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Projets",
  description: "Les projets immobiliers présentés sur Lebna : promoteurs, locatif, propriété progressive, maisons d'hôtes.",
};

export default function ProjectsPage(props: PageProps<"/projets">) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl space-y-3">
        <h1 className="font-display text-4xl font-semibold text-azur-900">Projets</h1>
        <p className="text-ink-soft">
          Les projets marqués « Exemple » sont fictifs : ils illustrent ce que vous pourrez financer sur Lebna. Les
          intentions que vous déclarez restent non engageantes.
        </p>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <ProjectGrid searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function ProjectGrid({ searchParams }: Pick<PageProps<"/projets">, "searchParams">) {
  const { modele } = await searchParams;
  const active = isOneOf(modele, MODEL_ORDER) ? modele : null;
  const [projects, interest] = await Promise.all([getPublishedProjects(), getProjectInterest()]);
  const visible = active ? projects.filter((project) => project.model === active) : projects;

  return (
    <>
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filtrer par type de projet">
        <FilterChip href="/projets" active={!active} label="Tous" />
        {MODEL_ORDER.map((model) => (
          <FilterChip key={model} href={`/projets?modele=${model}`} active={active === model} label={MODELS[model].label} />
        ))}
      </nav>
      {visible.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} interest={interest[project.id]} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-sand-300 p-10 text-center text-muted">
          Aucun projet de ce type pour le moment.{" "}
          <Link href="/#liste-attente" className="font-semibold text-azur-700">
            Rejoignez la liste d&apos;attente
          </Link>{" "}
          pour être prévenu.
        </p>
      )}
    </>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-azur-700 bg-azur-700 text-white"
          : "border-sand-300 bg-white text-ink-soft hover:border-azur-500 hover:text-azur-700"
      }`}
    >
      {label}
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-[4.5rem] grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((key) => (
        <div key={key} className="h-[26rem] animate-pulse rounded-2xl bg-sand-100" />
      ))}
    </div>
  );
}
