import Link from "next/link";
import {
  INSTRUMENTS,
  MODELS,
  STATUSES,
  formatDuration,
  formatTND,
  type Project,
  type ProjectInterest,
  type ProjectModel,
  type ProjectStatus,
} from "@/lib/domain";

const COVER_TONES: Record<ProjectModel, string> = {
  developer_financing: "from-azur-700 via-azur-600 to-azur-500",
  rental: "from-terra-600 via-terra-500 to-terra-400",
  rent_to_own: "from-olive-600 via-[#6f8a45] to-[#93a96a]",
  hospitality: "from-azur-900 via-azur-800 to-terra-600",
};

// Generated cover: a brick wall in the model's colours, until projects have real photos.
export function ProjectCover({ model, className = "h-40" }: { model: ProjectModel; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-linear-to-br ${COVER_TONES[model]} ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 size-full opacity-25" preserveAspectRatio="none">
        <defs>
          <pattern id={`bricks-${model}`} width="48" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 0.5H48M0 12.5H48M24 0.5V12.5M0 12.5V24M48 12.5V24" stroke="white" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#bricks-${model})`} />
      </svg>
      <svg viewBox="0 0 200 80" className="absolute right-4 bottom-0 h-3/4 opacity-90" fill="white">
        <rect x="20" y="30" width="40" height="50" opacity="0.85" />
        <rect x="64" y="10" width="46" height="70" />
        <rect x="114" y="40" width="34" height="40" opacity="0.7" />
        <path d="M150 80V52a14 14 0 0 1 28 0v28z" opacity="0.85" />
      </svg>
    </div>
  );
}

const STATUS_TONES: Record<ProjectStatus, string> = {
  draft: "bg-sand-200 text-ink-soft",
  coming_soon: "bg-amber-50 text-amber-700",
  open: "bg-olive-50 text-olive-600",
  funded: "bg-azur-50 text-azur-700",
  closed: "bg-sand-200 text-ink-soft",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[status]}`}>
      {status === "open" ? <span className="size-1.5 rounded-full bg-olive-600" /> : null}
      {STATUSES[status]}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span
      className="inline-flex rounded-full border border-dashed border-ink-soft/40 bg-white/80 px-2.5 py-1 text-xs font-medium text-ink-soft"
      title="Projet fictif présenté à titre d'illustration"
    >
      Exemple
    </span>
  );
}

export function InterestBar({ interest, target }: { interest?: ProjectInterest; target: number }) {
  const total = interest?.totalAmount ?? 0;
  const percent = Math.min(100, Math.round((total / target) * 100));
  return (
    <div className="space-y-1.5">
      <div className="h-2 overflow-hidden rounded-full bg-sand-200">
        <div className="h-full rounded-full bg-terra-500" style={{ width: `${Math.max(percent, total > 0 ? 2 : 0)}%` }} />
      </div>
      <p className="flex justify-between text-xs text-muted">
        <span>
          <strong className="font-semibold text-ink">{formatTND(total)}</strong> d&apos;intentions
          {interest ? ` · ${interest.investorCount} investisseur${interest.investorCount > 1 ? "s" : ""}` : ""}
        </span>
        <span>{percent} %</span>
      </p>
    </div>
  );
}

export function ProjectCard({ project, interest }: { project: Project; interest?: ProjectInterest }) {
  return (
    <Link
      href={`/projets/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <ProjectCover model={project.model} />
        <div className="absolute top-3 left-3 flex gap-2">
          <StatusBadge status={project.status} />
          {project.is_demo ? <DemoBadge /> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-terra-500 uppercase">
            {MODELS[project.model].label} · {project.city}
          </p>
          <h3 className="font-display text-xl font-semibold text-ink group-hover:text-azur-700">{project.title}</h3>
          {project.tagline ? <p className="text-sm leading-relaxed text-muted">{project.tagline}</p> : null}
        </div>
        <dl className="grid grid-cols-3 gap-2 rounded-xl bg-sand-50 p-3 text-center">
          <Figure label="Objectif" value={formatTND(project.target_amount)} />
          <Figure
            label="Rendement cible"
            value={project.target_return_pct != null ? `${project.target_return_pct} %/an` : "—"}
          />
          <Figure label="Durée" value={project.duration_months ? formatDuration(project.duration_months) : "—"} />
        </dl>
        <div className="mt-auto space-y-3">
          <InterestBar interest={interest} target={project.target_amount} />
          <p className="text-xs text-muted">
            {INSTRUMENTS[project.instrument]} · dès {formatTND(project.min_ticket)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
