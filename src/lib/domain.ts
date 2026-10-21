// Types mirroring supabase/migrations, plus the French labels and formatters shown in the UI.

export type Residency = "resident" | "non_resident";
export type ProjectModel = "developer_financing" | "rental" | "rent_to_own" | "hospitality";
export type ProjectStatus = "draft" | "coming_soon" | "open" | "funded" | "closed";
export type Instrument = "shares" | "sukuk" | "bonds" | "loan";
export type KycStatus = "incomplete" | "pending_review" | "verified" | "rejected";

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  city: string;
  governorate: string;
  model: ProjectModel;
  instrument: Instrument;
  status: ProjectStatus;
  target_amount: number;
  min_ticket: number;
  target_return_pct: number | null;
  duration_months: number | null;
  developer_name: string | null;
  description: string;
  highlights: string[];
  risks: string[];
  is_demo: boolean;
  opens_on: string | null;
};

export const PROJECT_COLUMNS =
  "id, slug, title, tagline, city, governorate, model, instrument, status, target_amount, min_ticket, " +
  "target_return_pct, duration_months, developer_name, description, highlights, risks, is_demo, opens_on";

export type InvestorProfile = {
  id: string;
  full_name: string;
  phone: string | null;
  country: string;
  residency: Residency | null;
  city: string | null;
  birth_date: string | null;
  profession: string | null;
  annual_income_range: string | null;
  investable_assets_range: string | null;
  experience_level: string | null;
  prefers_sukuk: boolean;
  risk_acknowledged_at: string | null;
  kyc_status: KycStatus;
};

export type ProjectInterest = { investorCount: number; totalAmount: number };

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
};

export const idleState: FormState = { status: "idle" };

export const MODELS: Record<ProjectModel, { label: string; description: string; returns: string }> = {
  developer_financing: {
    label: "Financement promoteur",
    description: "Compléter les fonds propres d'un promoteur pour lancer ou achever un programme.",
    returns: "Intérêts fixes, remboursés à la vente des lots",
  },
  rental: {
    label: "Immobilier locatif",
    description: "Une société de projet achète des logements et les met en location.",
    returns: "Loyers nets et plus-value à la revente",
  },
  rent_to_own: {
    label: "Propriété progressive",
    description: "Une famille loue son logement et en rachète des parts chaque mois.",
    returns: "Loyers réguliers, structure sukuk possible",
  },
  hospitality: {
    label: "Maison d'hôtes",
    description: "Restaurer une demeure traditionnelle et l'exploiter en hébergement touristique.",
    returns: "Part du résultat d'exploitation",
  },
};

export const MODEL_ORDER: ProjectModel[] = ["developer_financing", "rental", "rent_to_own", "hospitality"];

export const STATUSES: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  coming_soon: "Bientôt",
  open: "Intentions ouvertes",
  funded: "Objectif atteint",
  closed: "Clôturé",
};

export const STATUS_ORDER: ProjectStatus[] = ["open", "coming_soon", "funded", "closed", "draft"];

export const INSTRUMENTS: Record<Instrument, string> = {
  shares: "Actions",
  sukuk: "Sukuk",
  bonds: "Obligations",
  loan: "Prêt",
};

export const KYC: Record<KycStatus, { label: string; description: string }> = {
  incomplete: {
    label: "Profil incomplet",
    description: "Complétez votre questionnaire investisseur pour déclarer des intentions.",
  },
  pending_review: {
    label: "En cours de vérification",
    description: "Votre questionnaire est complet. Vous pouvez déclarer des intentions non engageantes.",
  },
  verified: {
    label: "Profil vérifié",
    description: "Votre identité et votre profil ont été vérifiés.",
  },
  rejected: {
    label: "Profil refusé",
    description: "Votre profil n'a pas pu être validé. Contactez-nous pour en savoir plus.",
  },
};

export const TICKET_RANGES = [
  ["lt_1k", "Moins de 1 000 DT"],
  ["1k_5k", "1 000 – 5 000 DT"],
  ["5k_20k", "5 000 – 20 000 DT"],
  ["gt_20k", "Plus de 20 000 DT"],
] as const;

export const INCOME_RANGES = [
  ["lt_20k", "Moins de 20 000 DT"],
  ["20k_50k", "20 000 – 50 000 DT"],
  ["50k_100k", "50 000 – 100 000 DT"],
  ["gt_100k", "Plus de 100 000 DT"],
] as const;

export const ASSET_RANGES = [
  ["lt_10k", "Moins de 10 000 DT"],
  ["10k_50k", "10 000 – 50 000 DT"],
  ["50k_200k", "50 000 – 200 000 DT"],
  ["gt_200k", "Plus de 200 000 DT"],
] as const;

export const EXPERIENCE_LEVELS = [
  ["none", "Je n'ai jamais investi en dehors de l'épargne bancaire"],
  ["some", "J'ai déjà fait quelques placements (bourse, immobilier…)"],
  ["experienced", "J'investis régulièrement"],
] as const;

export const COUNTRIES = [
  ["TN", "Tunisie"],
  ["FR", "France"],
  ["DE", "Allemagne"],
  ["IT", "Italie"],
  ["BE", "Belgique"],
  ["CH", "Suisse"],
  ["CA", "Canada"],
  ["US", "États-Unis"],
  ["GB", "Royaume-Uni"],
  ["NL", "Pays-Bas"],
  ["AE", "Émirats arabes unis"],
  ["QA", "Qatar"],
  ["SA", "Arabie saoudite"],
  ["ZZ", "Autre pays"],
] as const;

export const GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili",
  "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

export function optionValues<T extends readonly (readonly [string, string])[]>(options: T): T[number][0][] {
  return options.map(([value]) => value);
}

export function labelOf(options: readonly (readonly [string, string])[], value: string | null | undefined) {
  return options.find(([code]) => code === value)?.[1] ?? "—";
}

// Accepts "600 000", "600000,5" or "600000.5" as typed in French-formatted inputs.
export function parseAmount(raw: string) {
  const cleaned = raw.replace(/[\s  ]/g, "").replace(",", ".");
  return cleaned === "" ? Number.NaN : Number(cleaned);
}

export function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

const amountFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formatTND(amount: number) {
  return `${amountFormat.format(amount)} DT`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function formatDuration(months: number) {
  if (months % 12 === 0) return `${months / 12} an${months === 12 ? "" : "s"}`;
  return `${months} mois`;
}

export function isCollecting(status: ProjectStatus) {
  return status === "coming_soon" || status === "open";
}

// Only same-site relative paths, so `?next=` can't send people to another domain.
export function safeNextPath(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
