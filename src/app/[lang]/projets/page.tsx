import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectCard } from "@/components/project-card";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getDictionary, getLocale } from "@/i18n/server";
import { getProjectInterest, getPublishedProjects } from "@/lib/data";
import { MODEL_ORDER, isOneOf, localizeProject } from "@/lib/domain";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.projects.metaTitle, description: t.projects.metaDescription };
}

export default async function ProjectsPage(props: PageProps<"/[lang]/projets">) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl space-y-3">
        <h1 className="font-display text-4xl font-semibold text-azur-900">{t.projects.title}</h1>
        <p className="text-ink-soft">{t.projects.intro}</p>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <ProjectGrid searchParams={props.searchParams} t={t} locale={locale} />
      </Suspense>
    </main>
  );
}

async function ProjectGrid({
  searchParams,
  t,
  locale,
}: Pick<PageProps<"/[lang]/projets">, "searchParams"> & { t: Dictionary; locale: Locale }) {
  const { modele } = await searchParams;
  const active = isOneOf(modele, MODEL_ORDER) ? modele : null;
  const [projects, interest] = await Promise.all([getPublishedProjects(), getProjectInterest()]);
  const visible = active ? projects.filter((project) => project.model === active) : projects;
  const base = `/${locale}/projets`;

  return (
    <>
      <nav className="mt-8 flex flex-wrap gap-2" aria-label={t.projects.filterLabel}>
        <FilterChip href={base} active={!active} label={t.projects.filterAll} />
        {MODEL_ORDER.map((model) => (
          <FilterChip
            key={model}
            href={`${base}?modele=${model}`}
            active={active === model}
            label={t.labels.models[model].label}
          />
        ))}
      </nav>
      {visible.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={localizeProject(project, locale)}
              interest={interest[project.id]}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-sand-300 p-10 text-center text-muted">
          {t.projects.empty}{" "}
          <Link href={`/${locale}#liste-attente`} className="font-semibold text-azur-700">
            {t.projects.emptyLink}
          </Link>{" "}
          {t.projects.emptyAfter}
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
