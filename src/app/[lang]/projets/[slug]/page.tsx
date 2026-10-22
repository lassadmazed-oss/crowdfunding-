import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoBadge, InterestBar, ProjectCover, StatusBadge } from "@/components/project-card";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate, formatDuration, formatNumber, formatTND } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { getProjectBySlug, getProjectInterest } from "@/lib/data";
import { localizeProject } from "@/lib/domain";
import { IntentPanel } from "./intent-panel";

export async function generateMetadata(props: PageProps<"/[lang]/projets/[slug]">): Promise<Metadata> {
  const [{ slug }, t, locale] = await Promise.all([props.params, getDictionary(), getLocale()]);
  const found = await getProjectBySlug(slug);
  if (!found) return { title: t.project.notFoundTitle };
  const project = localizeProject(found, locale);
  return { title: project.title, description: project.tagline ?? t.labels.models[project.model].description };
}

export default async function ProjectPage(props: PageProps<"/[lang]/projets/[slug]">) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href={`/${locale}/projets`} className="text-sm font-medium text-azur-700 hover:text-azur-800">
        {t.project.back}
      </Link>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-3xl bg-sand-100" />}>
        <ProjectDetail params={props.params} t={t} locale={locale} />
      </Suspense>
    </main>
  );
}

async function ProjectDetail({
  params,
  t,
  locale,
}: Pick<PageProps<"/[lang]/projets/[slug]">, "params"> & { t: Dictionary; locale: Locale }) {
  const { slug } = await params;
  const [found, interest] = await Promise.all([getProjectBySlug(slug), getProjectInterest()]);
  if (!found) notFound();
  const project = localizeProject(found, locale);

  const figures = [
    { label: t.project.figures.target, value: formatTND(project.target_amount, locale) },
    { label: t.project.figures.minTicket, value: formatTND(project.min_ticket, locale) },
    {
      label: t.project.figures.targetReturn,
      value:
        project.target_return_pct != null
          ? fill(t.project.perYearLong, { n: formatNumber(project.target_return_pct, locale) })
          : "—",
    },
    {
      label: t.project.figures.duration,
      value: project.duration_months ? formatDuration(project.duration_months, locale, t.project) : "—",
    },
    { label: t.project.figures.instrument, value: t.labels.instruments[project.instrument] },
    {
      label: t.project.figures.opensOn,
      value: project.opens_on ? formatDate(project.opens_on, locale) : t.project.figures.opensOnLicence,
    },
  ];
  const governorate =
    t.labels.governorates[project.governorate as keyof Dictionary["labels"]["governorates"]] ?? project.governorate;

  return (
    <article className="mt-6">
      <div className="overflow-hidden rounded-3xl">
        <ProjectCover model={project.model} className="h-56 sm:h-72" />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} label={t.labels.statuses[project.status]} />
              {project.is_demo ? <DemoBadge label={t.common.exampleBadge} title={t.common.exampleBadgeTitle} /> : null}
              <span className="text-sm text-muted">
                {t.labels.models[project.model].label} · {project.city}, {governorate}
              </span>
            </div>
            <h1 className="font-display text-4xl font-semibold text-azur-900">{project.title}</h1>
            {project.tagline ? <p className="text-lg text-ink-soft">{project.tagline}</p> : null}
            {project.is_demo ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{t.project.demoNotice}</p>
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
            <h2 className="font-display text-2xl font-semibold text-ink">{t.project.about}</h2>
            <p className="leading-relaxed whitespace-pre-line text-ink-soft">{project.description}</p>
            {project.developer_name ? (
              <p className="text-sm text-muted">{fill(t.project.developer, { name: project.developer_name })}</p>
            ) : null}
          </section>

          {project.highlights.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-ink">{t.project.highlights}</h2>
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
            <h2 className="font-display text-2xl font-semibold text-ink">{t.project.risks}</h2>
            <ul className="space-y-2">
              {[...project.risks, t.project.capitalRisk].map((item) => (
                <li key={item} className="flex gap-2 rounded-xl bg-terra-50 px-4 py-3 text-sm text-ink">
                  <span className="text-terra-600">!</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <p className="mb-3 text-sm font-medium text-ink">{t.project.interest}</p>
            <InterestBar interest={interest[project.id]} target={project.target_amount} locale={locale} t={t} />
          </div>
          <Suspense fallback={<div className="h-56 animate-pulse rounded-2xl bg-sand-100" />}>
            <IntentPanel project={project} t={t} locale={locale} />
          </Suspense>
        </aside>
      </div>
    </article>
  );
}
