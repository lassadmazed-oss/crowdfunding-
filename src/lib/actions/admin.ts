"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, isUuid } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import {
  GOVERNORATES,
  MODEL_ORDER,
  STATUS_ORDER,
  isOneOf,
  parseAmount,
  type FormState,
  type Instrument,
} from "@/lib/domain";

// Every action re-checks admin rights; the database refuses the writes for anyone else anyway.
const DENIED: FormState = { status: "error", message: "Accès réservé aux administrateurs." };
const INSTRUMENT_VALUES: Instrument[] = ["shares", "sukuk", "bonds", "loan"];

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

function lines(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 10);
}

export async function saveProject(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return DENIED;

  const field = (name: string, max = 200) => String(formData.get(name) ?? "").trim().slice(0, max);
  const id = field("id");
  const values = {
    title: field("title", 120),
    slug: field("slug", 80),
    tagline: field("tagline", 160),
    city: field("city", 80),
    governorate: field("governorate"),
    model: field("model"),
    instrument: field("instrument"),
    status: field("status"),
    target_amount: field("target_amount", 20),
    min_ticket: field("min_ticket", 20),
    target_return_pct: field("target_return_pct", 10),
    duration_months: field("duration_months", 5),
    developer_name: field("developer_name", 120),
    description: String(formData.get("description") ?? "").trim().slice(0, 5000),
    highlights: String(formData.get("highlights") ?? ""),
    risks: String(formData.get("risks") ?? ""),
    opens_on: field("opens_on", 10),
    is_demo: formData.get("is_demo") === "on" ? "on" : "",
  };
  const slug = values.slug ? slugify(values.slug) : slugify(values.title);
  const targetAmount = parseAmount(values.target_amount);
  const minTicket = parseAmount(values.min_ticket);
  const targetReturn = values.target_return_pct ? parseAmount(values.target_return_pct) : null;
  const duration = values.duration_months ? Number(values.duration_months) : null;
  const risks = lines(values.risks);

  const errors: Record<string, string> = {};
  if (values.title.length < 3) errors.title = "Titre trop court.";
  if (!slug) errors.slug = "Adresse invalide : lettres, chiffres et tirets.";
  if (values.city.length < 2) errors.city = "Indiquez la ville.";
  if (!isOneOf(values.governorate, GOVERNORATES)) errors.governorate = "Choisissez un gouvernorat.";
  if (!isOneOf(values.model, MODEL_ORDER)) errors.model = "Choisissez un type de projet.";
  if (!isOneOf(values.instrument, INSTRUMENT_VALUES)) errors.instrument = "Choisissez un instrument.";
  if (!isOneOf(values.status, STATUS_ORDER)) errors.status = "Choisissez un statut.";
  if (!(targetAmount > 0)) errors.target_amount = "Montant invalide.";
  if (!(minTicket > 0)) errors.min_ticket = "Montant invalide.";
  else if (targetAmount > 0 && minTicket > targetAmount) errors.min_ticket = "Doit être inférieur à l'objectif.";
  if (targetReturn !== null && !(targetReturn >= 0 && targetReturn <= 100)) {
    errors.target_return_pct = "Entre 0 et 100.";
  }
  if (duration !== null && !(Number.isInteger(duration) && duration > 0 && duration <= 600)) {
    errors.duration_months = "Nombre de mois entier.";
  }
  if (values.opens_on && Number.isNaN(Date.parse(values.opens_on))) errors.opens_on = "Date invalide.";
  if (values.status !== "draft" && risks.length === 0) {
    errors.risks = "Indiquez au moins un risque avant de publier.";
  }
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Certains champs sont à corriger.", errors, values };
  }

  const row = {
    title: values.title,
    slug,
    tagline: values.tagline || null,
    city: values.city,
    governorate: values.governorate,
    model: values.model,
    instrument: values.instrument,
    status: values.status,
    target_amount: targetAmount,
    min_ticket: minTicket,
    target_return_pct: targetReturn,
    duration_months: duration,
    developer_name: values.developer_name || null,
    description: values.description,
    highlights: lines(values.highlights),
    risks,
    opens_on: values.opens_on || null,
    is_demo: values.is_demo === "on",
  };

  const supabase = await createClient();
  const result = isUuid(id)
    ? await supabase.from("projects").update(row).eq("id", id).select("id").maybeSingle()
    : await supabase.from("projects").insert(row).select("id").single();

  if (result.error) {
    if (result.error.code === "23505") {
      return { status: "error", errors: { slug: "Cette adresse est déjà utilisée par un autre projet." }, values };
    }
    return { status: "error", message: "L'enregistrement a échoué. Réessayez.", values };
  }
  if (!result.data) return DENIED;

  updateTag("projects");
  if (!isUuid(id)) redirect(`/admin/projets/${result.data.id}?cree=1`);

  refresh();
  return { status: "success", message: "Projet enregistré." };
}

export async function deleteProject(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return;

  const supabase = await createClient();
  // Projects with declared intents are closed rather than deleted, to keep investors' history.
  const { count } = await supabase
    .from("investment_intents")
    .select("id", { count: "exact", head: true })
    .eq("project_id", id);
  if (count) return;

  await supabase.from("projects").delete().eq("id", id);
  updateTag("projects");
  redirect("/admin/projets");
}

export async function deleteWaitlistEntry(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return;

  const supabase = await createClient();
  await supabase.from("waitlist").delete().eq("id", id);
  refresh();
}

export async function reviewKyc(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return DENIED;

  const investorId = String(formData.get("investor_id") ?? "");
  const decision = formData.get("decision");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const values = { note };

  if (!isUuid(investorId) || !isOneOf(decision, ["verified", "rejected", "pending_review"] as const)) {
    return { status: "error", message: "Décision invalide.", values };
  }
  if (decision === "rejected" && !note) {
    return { status: "error", errors: { note: "Expliquez la raison du refus." }, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_kyc", {
    p_investor_id: investorId,
    p_status: decision,
    p_note: note || null,
  });
  if (error) {
    const message =
      error.code === "22023"
        ? "Le questionnaire de cet investisseur est incomplet : vous pouvez seulement le refuser."
        : error.code === "42501"
          ? DENIED.message
          : "La décision n'a pas été enregistrée. Réessayez.";
    return { status: "error", message, values };
  }

  refresh();
  const labels = { verified: "Profil validé.", rejected: "Profil refusé.", pending_review: "Profil remis en vérification." };
  return { status: "success", message: labels[decision] };
}
