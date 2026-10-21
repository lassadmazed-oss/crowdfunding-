import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoBadge, InterestBar, ProjectCover, StatusBadge } from "@/components/project-card";
import { getProjectBySlug, getProjectInterest } from "@/lib/data";
import { INSTRUMENTS, MODELS, formatDate, formatDuration, formatTND } from "@/lib/domain";
import { IntentPanel } from "./intent-panel";

export async function generateMetadata(props: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Projet introuvable" };
  return { title: project.title, description: project.tagline ?? MODELS[project.model].description };
}

export default function ProjectPage(props: PageProps<"/projets/[slug]">) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/projets" className="text-sm font-medium text-azur-700 hover:text-azur-800">
        ← Tous les projets
      </Link>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-3xl bg-sand-100" />}>
        <ProjectDetail params={props.params} />
      </Suspense>
    </main>
  );
}

async function ProjectDetail({ params }: Pick<PageProps<"/projets/[slug]">, "params">) {
  const { slug } = await params;
  const [project, interest] = await Promise.all([getProjectBySlug(slug), getProjectInterest()]);
  if (!project) notFound();

  const figures = [
    { label: "Objectif de collecte", value: formatTND(project.target_amount) },
    { label: "Ticket minimum", value: formatTND(project.min_ticket) },
    {
      label: "Rendement cible",
      value: project.target_return_pct != null ? `${project.target_return_pct} % par an` : "—",
    },
    { label: "Durée", value: project.duration_months ? formatDuration(project.duration_months) : "—" },
    { label: "Instrument", value: INSTRUMENTS[project.instrument] },
    { label: "Ouverture prévue", value: project.opens_on ? formatDate(project.opens_on) : "Dès l'agrément" },
  ];

  return (
    <article className="mt-6">
      <div className="overflow-hidden rounded-3xl">
        <ProjectCover model={project.model} className="h-56 sm:h-72" />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              {project.is_demo ? <DemoBadge /> : null}
              <span className="text-sm text-muted">
                {MODELS[project.model].label} · {project.city}, {project.governorate}
              </span>
            </div>
            <h1 className="font-display text-4xl font-semibold text-azur-900">{project.title}</h1>
            {project.tagline ? <p className="text-lg text-ink-soft">{project.tagline}</p> : null}
            {project.is_demo ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Projet fictif présenté à titre d&apos;exemple. Les chiffres sont indicatifs.
              </p>
            ) : null}
          </header>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-3">
            {figures.map((figure) => (
              <div key={figure.label} className="bg-white p-4">
                <dt className="text-xs text-muted">{figure.label}</dt>
                <dd className="mt-1 font-semibold text-ink">{figure.value}</dd>
              </div>
            ))}
          </dl>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink">Le projet</h2>
            <p className="leading-relaxed whitespace-pre-line text-ink-soft">{project.description}</p>
            {project.developer_name ? (
              <p className="text-sm text-muted">Porteur du projet : {project.developer_name}</p>
            ) : null}
          </section>

          {project.highlights.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-ink">Points forts</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {project.highlights.map((item) => (
                  <li key={item} className="flex gap-2 rounded-xl bg-olive-50 px-4 py-3 text-sm text-ink">
                    <span className="text-olive-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink">Risques à connaître</h2>
            <ul className="space-y-2">
              {project.risks.map((item) => (
                <li key={item} className="flex gap-2 rounded-xl bg-terra-50 px-4 py-3 text-sm text-ink">
                  <span className="text-terra-600">!</span>
                  {item}
                </li>
              ))}
              <li className="flex gap-2 rounded-xl bg-terra-50 px-4 py-3 text-sm text-ink">
                <span className="text-terra-600">!</span>
                Perte en capital possible : n&apos;investissez que ce que vous pouvez immobiliser.
              </li>
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <p className="mb-3 text-sm font-medium text-ink">Intérêt déclaré</p>
            <InterestBar interest={interest[project.id]} target={project.target_amount} />
          </div>
          <Suspense fallback={<div className="h-56 animate-pulse rounded-2xl bg-sand-100" />}>
            <IntentPanel project={project} />
          </Suspense>
        </aside>
      </div>
    </article>
  );
}
