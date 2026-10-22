"use server";

import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";
import { loadDictionary } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ASSET_RANGE_CODES,
  COUNTRY_CODES,
  EXPERIENCE_CODES,
  INCOME_RANGE_CODES,
  isOneOf,
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
  const lang = formData.get("lang");
  const locale = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/connexion?next=/${locale}/espace/profil`);
  const t = (await loadDictionary(locale)).profile.errors;

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
  if (values.full_name.length < 3) errors.full_name = t.fullName;
  if (!PHONE_PATTERN.test(values.phone)) errors.phone = t.phone;
  if (!isAdult(values.birth_date)) errors.birth_date = t.birthDate;
  if (!isOneOf(values.residency, ["resident", "non_resident"] as const)) errors.residency = t.residency;
  if (!isOneOf(values.country, COUNTRY_CODES)) errors.country = t.country;
  if (values.residency === "non_resident" && values.country === "TN") errors.country = t.countryAbroad;
  if (values.profession.length < 2) errors.profession = t.profession;
  if (!isOneOf(values.annual_income_range, INCOME_RANGE_CODES)) errors.annual_income_range = t.income;
  if (!isOneOf(values.investable_assets_range, ASSET_RANGE_CODES)) errors.investable_assets_range = t.assets;
  if (!isOneOf(values.experience_level, EXPERIENCE_CODES)) errors.experience_level = t.experience;
  if (values.risk_ack !== "on") errors.risk_ack = t.risk;
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: t.form, errors, values };
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
  if (error) return { status: "error", message: t.failed, values };

  redirect(`/${locale}/espace?profil=enregistre`);
}
