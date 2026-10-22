"use server";

import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";
import { loadDictionary } from "@/i18n/dictionaries";
import { createPublicClient } from "@/lib/supabase/public";
import {
  COUNTRY_CODES,
  EMAIL_PATTERN,
  MODEL_ORDER,
  TICKET_RANGE_CODES,
  isOneOf,
  type FormState,
} from "@/lib/domain";

export async function joinWaitlist(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = formData.get("lang");
  const locale = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = (await loadDictionary(locale)).waitlist;

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const residency = formData.get("residency");
  const country = residency === "resident" ? "TN" : formData.get("country");
  const ticketRange = formData.get("ticket_range");
  const interests = formData.getAll("interests").filter((value) => isOneOf(value, MODEL_ORDER));

  const values = {
    email,
    full_name: fullName,
    residency: String(residency ?? ""),
    country: String(country ?? ""),
    ticket_range: String(ticketRange ?? ""),
    interests: interests as string[],
  };

  const errors: Record<string, string> = {};
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = t.errors.email;
  if (!isOneOf(residency, ["resident", "non_resident"] as const)) errors.residency = t.errors.residency;
  if (residency === "non_resident" && !isOneOf(country, COUNTRY_CODES.filter((code) => code !== "TN"))) {
    errors.country = t.errors.country;
  }
  if (ticketRange && !isOneOf(ticketRange, TICKET_RANGE_CODES)) errors.ticket_range = t.errors.ticket;
  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  const { error } = await createPublicClient()
    .from("waitlist")
    .insert({
      email,
      full_name: fullName || null,
      residency,
      country,
      ticket_range: ticketRange || null,
      interests,
      source: `landing-${locale}`,
    });

  // Already on the list counts as success, so the form doesn't reveal who signed up.
  if (error && error.code !== "23505") {
    return { status: "error", message: t.errors.failed, values };
  }

  return { status: "success", message: t.success };
}
