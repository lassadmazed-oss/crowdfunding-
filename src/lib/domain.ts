// Types mirroring supabase/migrations, the option codes used in forms, and small shared helpers.
// Human-readable labels live in the dictionaries (src/i18n/dictionaries).

import { CONTENT_LOCALE, type Locale } from "@/i18n/config";

export type Residency = "resident" | "non_resident";
export type ProjectModel = "developer_financing" | "rental" | "rent_to_own" | "hospitality";
export type ProjectStatus = "draft" | "coming_soon" | "open" | "funded" | "closed";
export type Instrument = "shares" | "sukuk" | "bonds" | "loan";
export type KycStatus = "incomplete" | "pending_review" | "verified" | "rejected";

export type ProjectText = {
  title: string;
  tagline: string | null;
  city: string;
  description: string;
  highlights: string[];
  risks: string[];
};

export const PROJECT_TEXT_FIELDS = ["title", "tagline", "city", "description", "highlights", "risks"] as const;

export type Project = ProjectText & {
  id: string;
  slug: string;
  governorate: string;
  model: ProjectModel;
  instrument: Instrument;
  status: ProjectStatus;
  target_amount: number;
  min_ticket: number;
  target_return_pct: number | null;
  duration_months: number | null;
  developer_name: string | null;
  is_demo: boolean;
  opens_on: string | null;
  translations: Partial<Record<Locale, Partial<ProjectText>>>;
};

export const PROJECT_COLUMNS =
  "id, slug, title, tagline, city, governorate, model, instrument, status, target_amount, min_ticket, " +
  "target_return_pct, duration_months, developer_name, description, highlights, risks, is_demo, opens_on, translations";

type Translatable = Partial<ProjectText> & { translations?: Project["translations"] | null };

// Swaps in the project's texts for `locale`, falling back to the base (French) text field by field.
// Works on full projects and on partial selects (e.g. title and city only).
export function localizeProject<T extends Translatable>(project: T, locale: Locale): T {
  const text = locale === CONTENT_LOCALE ? undefined : project.translations?.[locale];
  if (!text) return project;
  const localized: Record<string, unknown> = { ...project };
  for (const field of PROJECT_TEXT_FIELDS) {
    const value = text[field];
    if (field in project && (Array.isArray(value) ? value.length > 0 : Boolean(value))) localized[field] = value;
  }
  return localized as T;
}

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

export const MODEL_ORDER: ProjectModel[] = ["developer_financing", "rental", "rent_to_own", "hospitality"];
export const STATUS_ORDER: ProjectStatus[] = ["open", "coming_soon", "funded", "closed", "draft"];
export const INSTRUMENT_ORDER: Instrument[] = ["shares", "sukuk", "bonds", "loan"];
export const KYC_STATUSES: KycStatus[] = ["incomplete", "pending_review", "verified", "rejected"];

export const TICKET_RANGE_CODES = ["lt_1k", "1k_5k", "5k_20k", "gt_20k"] as const;
export const INCOME_RANGE_CODES = ["lt_20k", "20k_50k", "50k_100k", "gt_100k"] as const;
export const ASSET_RANGE_CODES = ["lt_10k", "10k_50k", "50k_200k", "gt_200k"] as const;
export const EXPERIENCE_CODES = ["none", "some", "experienced"] as const;
export const COUNTRY_CODES = ["TN", "FR", "DE", "AT", "IT", "BE", "CH", "CA", "US", "GB", "NL", "AE", "QA", "SA", "ZZ"] as const;

// Stored in projects.governorate; translated for display through the dictionaries.
export const GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili",
  "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

export function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

// Looks up a label by code in a dictionary section, tolerating codes the dictionary doesn't know.
export function labelFor(labels: Record<string, string>, code: string | null | undefined) {
  return (code && labels[code]) || "—";
}

// Accepts "600 000", "600000,5" or "600000.5" as typed in French-formatted inputs.
export function parseAmount(raw: string) {
  const cleaned = raw.replace(/[\s  ]/g, "").replace(",", ".");
  return cleaned === "" ? Number.NaN : Number(cleaned);
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
