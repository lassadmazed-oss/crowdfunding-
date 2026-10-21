import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { getProjectInterest, getPublishedProjects } from "@/lib/data";
import { MODELS, MODEL_ORDER } from "@/lib/domain";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <WhyNow />
      <Models />
      <HowItWorks />
      <FeaturedProjects />
      <Waitlist />
      <Regulation />
    </main>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
      <div className="space-y-7">
        <p className="inline-flex items-center gap-2 rounded-full border border-terra-100 bg-terra-50 px-3 py-1 text-xs font-semibold tracking-wide text-terra-600 uppercase">
          Crowdfunding immobilier · Tunisie
        </p>
        <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-azur-900 sm:text-5xl lg:text-6xl">
          Investissez dans l&apos;immobilier tunisien, <span className="text-terra-500">brique par brique.</span>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
          Lebna permet à chacun, en Tunisie comme à l&apos;étranger, de financer des projets immobiliers concrets à
          partir de 500 DT, et d&apos;en partager les revenus.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="#liste-attente" className={buttonClass}>
            Rejoindre la liste d&apos;attente
          </Link>
          <Link href="/projets" className={secondaryButtonClass}>
            Voir les projets
          </Link>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li>✓ Cadre légal : loi n° 2020-37</li>
          <li>✓ Fonds sur compte bancaire séparé</li>
          <li>✓ Option sukuk</li>
        </ul>
      </div>
      <HeroVisual />
    </section>
  );
}

function HeroVisual() {
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
      <div className="absolute top-16 left-2 rounded-2xl bg-white px-4 py-3 shadow-lg sm:-left-6">
        <p className="text-xs text-muted">Ticket minimum</p>
        <p className="font-display text-2xl font-semibold text-azur-900">500 DT</p>
      </div>
      <div className="absolute right-2 bottom-24 rounded-2xl bg-white px-4 py-3 shadow-lg sm:-right-4">
        <p className="text-xs text-muted">Ouvert à</p>
        <p className="font-semibold text-ink">Résidents & diaspora</p>
      </div>
    </div>
  );
}

const STATS = [
  { value: "10–11 %", label: "Le taux auquel les promoteurs empruntent aujourd'hui auprès des banques" },
  { value: "+5 %", label: "La hausse des prix de vente immobiliers en 2025" },
  { value: "8 Mrd DT", label: "Les transferts des Tunisiens de l'étranger en 2025" },
  { value: "0", label: "Plateforme de crowdfunding immobilier agréée à ce jour, à notre connaissance" },
];

function WhyNow() {
  return (
    <section className="border-y border-sand-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold text-azur-900">Pourquoi maintenant ?</h2>
          <p className="text-ink-soft">
            Le crédit immobilier recule, les promoteurs manquent de fonds propres, et l&apos;épargne des Tunisiens
            cherche des placements concrets. La foule peut combler cet écart.
          </p>
        </div>
        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.value} className="rounded-2xl bg-sand-50 p-5">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-4xl font-semibold text-terra-500">{stat.value}</dd>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{stat.label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted">Sources : Mubawab et La Presse (2025), CnBees (2026).</p>
      </div>
    </section>
  );
}

function Models() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl space-y-3">
        <h2 className="font-display text-3xl font-semibold text-azur-900">Quatre façons d&apos;investir</h2>
        <p className="text-ink-soft">Chaque projet est porté par une société dédiée, avec un objectif et des risques clairs.</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {MODEL_ORDER.map((model, index) => (
          <article key={model} className="flex gap-4 rounded-2xl border border-sand-200 bg-white p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-azur-50 font-display text-lg font-semibold text-azur-700">
              {index + 1}
            </span>
            <div className="space-y-1.5">
              <h3 className="font-display text-xl font-semibold text-ink">{MODELS[model].label}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{MODELS[model].description}</p>
              <p className="text-sm font-medium text-terra-600">{MODELS[model].returns}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Créez votre profil",
    text: "Un questionnaire de trois minutes sur votre situation et votre expérience, comme l'exige la réglementation.",
  },
  {
    title: "Choisissez vos projets",
    text: "Promoteur, garanties, rendement cible, risques : tout est détaillé. Déclarez votre intention, sans engagement.",
  },
  {
    title: "Investissez à l'ouverture",
    text: "Une fois l'agrément obtenu, les fonds passent par un compte séparé dans une banque partenaire, jamais par Lebna.",
  },
  {
    title: "Percevez vos revenus",
    text: "Intérêts, loyers ou part des bénéfices selon le projet, versés directement sur votre compte.",
  },
];

function HowItWorks() {
  return (
    <section id="fonctionnement" className="scroll-mt-28 bg-azur-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">Comment ça marche</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {STEPS.map((step, index) => (
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

async function FeaturedProjects() {
  const [projects, interest] = await Promise.all([getPublishedProjects(), getProjectInterest()]);
  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold text-azur-900">Les premiers projets</h2>
          <p className="text-ink-soft">Des exemples de ce que vous pourrez financer sur Lebna.</p>
        </div>
        <Link href="/projets" className="font-semibold text-azur-700 hover:text-azur-800">
          Tous les projets →
        </Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 3).map((project) => (
          <ProjectCard key={project.id} project={project} interest={interest[project.id]} />
        ))}
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section id="liste-attente" className="scroll-mt-28 border-y border-sand-200 bg-sand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-semibold text-azur-900">Soyez parmi les premiers</h2>
          <p className="text-ink-soft">
            Inscrivez-vous pour être prévenu de l&apos;ouverture des premiers projets et nous aider à choisir ceux qui
            vous intéressent.
          </p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>• Accès prioritaire aux premiers projets</li>
            <li>• Aucun engagement, aucun paiement</li>
            <li>• Ouvert aux Tunisiens résidents et à l&apos;étranger</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}

const TEXTS = [
  { title: "Loi n° 2020-37", text: "Organise le crowdfunding en titres, en prêts et en dons." },
  { title: "Décret n° 2022-765", text: "Fixe les conditions d'exercice et les plafonds applicables." },
  { title: "Règlement du CMF (2024)", text: "Encadre le crowdfunding en investissement dans des valeurs mobilières." },
];

function Regulation() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-semibold text-azur-900">Un cadre réglementé</h2>
          <p className="text-ink-soft">
            Lebna prépare sa demande d&apos;agrément auprès du Conseil du marché financier. D&apos;ici là, aucune somme
            n&apos;est collectée : vous pouvez seulement déclarer des intentions non engageantes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TEXTS.map((item) => (
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
