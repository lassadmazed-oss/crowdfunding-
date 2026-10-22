import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatTND } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { getProjectInterest, getPublishedProjects } from "@/lib/data";
import { MODEL_ORDER, localizeProject } from "@/lib/domain";

export default async function HomePage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main>
      <Hero t={t} locale={locale} />
      <WhyNow t={t} />
      <Models t={t} />
      <HowItWorks t={t} />
      <FeaturedProjects t={t} locale={locale} />
      <Waitlist t={t} locale={locale} />
      <Regulation t={t} />
    </main>
  );
}

type SectionProps = { t: Dictionary; locale: Locale };

function Hero({ t, locale }: SectionProps) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
      <div className="space-y-7">
        <p className="inline-flex items-center gap-2 rounded-full border border-terra-100 bg-terra-50 px-3 py-1 text-xs font-semibold tracking-wide text-terra-600 uppercase">
          {t.home.eyebrow}
        </p>
        <h1 className="font-display text-4xl leading-[1.15] font-semibold tracking-tight text-azur-900 sm:text-5xl lg:text-6xl">
          {t.home.titleStart} <span className="text-terra-500">{t.home.titleHighlight}</span>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft">{t.home.subtitle}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="#liste-attente" className={buttonClass}>
            {t.home.ctaWaitlist}
          </Link>
          <Link href={`/${locale}/projets`} className={secondaryButtonClass}>
            {t.home.ctaProjects}
          </Link>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {t.home.trust.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </div>
      <HeroVisual t={t} locale={locale} />
    </section>
  );
}

function HeroVisual({ t, locale }: SectionProps) {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-3xl bg-azur-800 shadow-xl">
        <svg className="absolute inset-0 size-full opacity-20">
          <defs>
            <pattern id="hero-bricks" width="64" height="32" patternUnits="userSpaceOnUse">
              <path d="M0 0.5H64M0 16.5H64M32 0.5V16.5M0 16.5V32M64 16.5V32" stroke="white" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-bricks)" />
        </svg>
        <div className="absolute inset-x-10 bottom-0 grid grid-cols-3 items-end gap-2">
          {[52, 78, 64].map((height, index) => (
            <div
              key={height}
              className={`rounded-t-lg ${index === 1 ? "bg-terra-500" : "bg-white/90"}`}
              style={{ height: `${height * 3}px` }}
            >
              <div className="grid grid-cols-2 gap-1.5 p-3">
                {Array.from({ length: Math.floor(height / 13) * 2 }, (_, window) => (
                  <span key={window} className={`h-3 rounded-sm ${index === 1 ? "bg-white/40" : "bg-azur-100"}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute start-2 top-16 rounded-2xl bg-white px-4 py-3 shadow-lg sm:-start-6">
        <p className="text-xs text-muted">{t.home.chipTicket}</p>
        <p className="font-display text-2xl font-semibold text-azur-900">{formatTND(500, locale)}</p>
      </div>
      <div className="absolute end-2 bottom-24 rounded-2xl bg-white px-4 py-3 shadow-lg sm:-end-4">
        <p className="text-xs text-muted">{t.home.chipOpenTo}</p>
        <p className="font-semibold text-ink">{t.home.chipOpenToValue}</p>
      </div>
    </div>
  );
}

function WhyNow({ t }: { t: Dictionary }) {
  return (
    <section className="border-y border-sand-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold text-azur-900">{t.home.whyTitle}</h2>
          <p className="text-ink-soft">{t.home.whyIntro}</p>
        </div>
        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-sand-50 p-5">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-4xl font-semibold text-terra-500" dir="ltr">
                {stat.value}
              </dd>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{stat.label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted">{t.home.sources}</p>
      </div>
    </section>
  );
}

function Models({ t }: { t: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl space-y-3">
        <h2 className="font-display text-3xl font-semibold text-azur-900">{t.home.modelsTitle}</h2>
        <p className="text-ink-soft">{t.home.modelsIntro}</p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {MODEL_ORDER.map((model, index) => (
          <article key={model} className="flex gap-4 rounded-2xl border border-sand-200 bg-white p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-azur-50 font-display text-lg font-semibold text-azur-700">
              {index + 1}
            </span>
            <div className="min-w-0 space-y-1.5">
              <h3 className="font-display text-xl font-semibold break-words hyphens-auto text-ink">
                {t.labels.models[model].label}
              </h3>
              <p className="text-sm leading-relaxed text-ink-soft">{t.labels.models[model].description}</p>
              <p className="text-sm font-medium text-terra-600">{t.labels.models[model].returns}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks({ t }: { t: Dictionary }) {
  return (
    <section id="fonctionnement" className="scroll-mt-28 bg-azur-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">{t.home.stepsTitle}</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {t.home.steps.map((step, index) => (
            <li key={step.title} className="space-y-3">
              <span className="grid size-10 place-items-center rounded-full bg-terra-500 font-semibold">{index + 1}</span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-azur-100">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

async function FeaturedProjects({ t, locale }: SectionProps) {
  const [projects, interest] = await Promise.all([getPublishedProjects(), getProjectInterest()]);
  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold text-azur-900">{t.home.featuredTitle}</h2>
          <p className="text-ink-soft">{t.home.featuredIntro}</p>
        </div>
        <Link href={`/${locale}/projets`} className="font-semibold text-azur-700 hover:text-azur-800">
          {t.home.featuredAll}
        </Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 3).map((project) => (
          <ProjectCard
            key={project.id}
            project={localizeProject(project, locale)}
            interest={interest[project.id]}
            locale={locale}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

function Waitlist({ t, locale }: SectionProps) {
  return (
    <section id="liste-attente" className="scroll-mt-28 border-y border-sand-200 bg-sand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-semibold text-azur-900">{t.home.waitlistTitle}</h2>
          <p className="text-ink-soft">{t.home.waitlistIntro}</p>
          <ul className="space-y-2 text-sm text-ink-soft">
            {t.home.waitlistBullets.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
          <WaitlistForm
            locale={locale}
            t={t.waitlist}
            models={t.labels.models}
            countries={t.labels.countries}
            ticketRanges={t.labels.ticketRanges}
          />
        </div>
      </div>
    </section>
  );
}

function Regulation({ t }: { t: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-semibold text-azur-900">{t.home.regulationTitle}</h2>
          <p className="text-ink-soft">{t.home.regulationIntro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.home.regulationTexts.map((item) => (
            <div key={item.title} className="rounded-2xl border border-sand-200 bg-white p-5">
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
