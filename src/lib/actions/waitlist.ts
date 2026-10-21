"use server";

import { createPublicClient } from "@/lib/supabase/public";
import {
  COUNTRIES,
  EMAIL_PATTERN,
  MODEL_ORDER,
  TICKET_RANGES,
  isOneOf,
  optionValues,
  type FormState,
} from "@/lib/domain";

export async function joinWaitlist(_prev: FormState, formData: FormData): Promise<FormState> {
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
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = "Entrez une adresse e-mail valide.";
  if (!isOneOf(residency, ["resident", "non_resident"] as const)) errors.residency = "Indiquez où vous résidez.";
  if (residency === "non_resident" && !isOneOf(country, optionValues(COUNTRIES).filter((c) => c !== "TN"))) {
    errors.country = "Choisissez votre pays de résidence.";
  }
  if (ticketRange && !isOneOf(ticketRange, optionValues(TICKET_RANGES))) errors.ticket_range = "Montant invalide.";
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
      source: "landing",
    });

  // Already on the list counts as success, so the form doesn't reveal who signed up.
  if (error && error.code !== "23505") {
    return { status: "error", message: "L'inscription n'a pas abouti. Réessayez dans un instant.", values };
  }

  return {
    status: "success",
    message: "C'est noté ! Vous serez parmi les premiers informés de l'ouverture des projets.",
  };
}
