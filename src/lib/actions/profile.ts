"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ASSET_RANGES,
  COUNTRIES,
  EXPERIENCE_LEVELS,
  INCOME_RANGES,
  isOneOf,
  optionValues,
  type FormState,
} from "@/lib/domain";

const PHONE_PATTERN = /^\+?[0-9 ().-]{8,20}$/;

function isAdult(birthDate: string) {
  const date = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const adultFrom = new Date();
  adultFrom.setUTCFullYear(adultFrom.getUTCFullYear() - 18);
  return date <= adultFrom && date.getUTCFullYear() > 1900;
}

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/espace/profil");

  const field = (name: string, max = 120) => String(formData.get(name) ?? "").trim().slice(0, max);
  const values = {
    full_name: field("full_name"),
    phone: field("phone", 30),
    birth_date: field("birth_date", 10),
    residency: field("residency"),
    country: field("country", 2),
    city: field("city", 80),
    profession: field("profession"),
    annual_income_range: field("annual_income_range"),
    investable_assets_range: field("investable_assets_range"),
    experience_level: field("experience_level"),
    prefers_sukuk: formData.get("prefers_sukuk") === "on" ? "on" : "",
    risk_ack: formData.get("risk_ack") === "on" ? "on" : "",
  };

  const errors: Record<string, string> = {};
  if (values.full_name.length < 3) errors.full_name = "Entrez votre nom complet.";
  if (!PHONE_PATTERN.test(values.phone)) errors.phone = "Numéro invalide (ex. +216 20 123 456).";
  if (!isAdult(values.birth_date)) errors.birth_date = "Vous devez avoir au moins 18 ans.";
  if (!isOneOf(values.residency, ["resident", "non_resident"] as const)) errors.residency = "Indiquez où vous résidez.";
  if (!isOneOf(values.country, optionValues(COUNTRIES))) errors.country = "Choisissez un pays.";
  if (values.residency === "non_resident" && values.country === "TN") {
    errors.country = "Indiquez votre pays de résidence à l'étranger.";
  }
  if (values.profession.length < 2) errors.profession = "Indiquez votre profession.";
  if (!isOneOf(values.annual_income_range, optionValues(INCOME_RANGES))) errors.annual_income_range = "Choisissez une tranche.";
  if (!isOneOf(values.investable_assets_range, optionValues(ASSET_RANGES))) {
    errors.investable_assets_range = "Choisissez une tranche.";
  }
  if (!isOneOf(values.experience_level, optionValues(EXPERIENCE_LEVELS))) errors.experience_level = "Choisissez une réponse.";
  if (values.risk_ack !== "on") errors.risk_ack = "Vous devez reconnaître ces risques pour continuer.";
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Certains champs sont à corriger.", errors, values };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("investor_profiles")
    .select("risk_acknowledged_at")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("investor_profiles")
    .update({
      full_name: values.full_name,
      phone: values.phone,
      birth_date: values.birth_date,
      residency: values.residency,
      country: values.country,
      city: values.city || null,
      profession: values.profession,
      annual_income_range: values.annual_income_range,
      investable_assets_range: values.investable_assets_range,
      experience_level: values.experience_level,
      prefers_sukuk: values.prefers_sukuk === "on",
      // Keep the date of the first acknowledgement: it is the one that matters for compliance.
      risk_acknowledged_at: current?.risk_acknowledged_at ?? new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { status: "error", message: "L'enregistrement a échoué. Réessayez.", values };

  redirect("/espace?profil=enregistre");
}
