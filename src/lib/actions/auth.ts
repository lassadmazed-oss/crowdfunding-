"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_PATTERN, isOneOf, safeNextPath, type FormState } from "@/lib/domain";

const AUTH_ERRORS: Record<string, string> = {
  user_already_exists: "Un compte existe déjà avec cet e-mail. Connectez-vous.",
  email_exists: "Un compte existe déjà avec cet e-mail. Connectez-vous.",
  weak_password: "Mot de passe trop faible : au moins 8 caractères, avec des lettres et des chiffres.",
  over_email_send_rate_limit: "Trop d'e-mails envoyés. Réessayez dans quelques minutes.",
  over_request_rate_limit: "Trop de tentatives. Réessayez dans quelques minutes.",
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  email_not_confirmed: "Confirmez d'abord votre adresse via le lien reçu par e-mail.",
  email_address_invalid: "Cette adresse e-mail n'est pas acceptée.",
  signup_disabled: "Les inscriptions sont fermées pour le moment.",
};

function authErrorMessage(code: string | undefined) {
  return (code && AUTH_ERRORS[code]) || "Une erreur est survenue. Réessayez.";
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const residency = formData.get("residency");
  const values = { full_name: fullName, email, residency: String(residency ?? "") };

  const errors: Record<string, string> = {};
  if (fullName.length < 3) errors.full_name = "Entrez votre nom complet.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Entrez une adresse e-mail valide.";
  if (password.length < 8) errors.password = "8 caractères minimum.";
  if (!isOneOf(residency, ["resident", "non_resident"] as const)) errors.residency = "Indiquez où vous résidez.";
  if (formData.get("consent") !== "on") errors.consent = "Cette confirmation est nécessaire.";
  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, residency },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm?next=/espace/profil`,
    },
  });
  if (error) return { status: "error", message: authErrorMessage(error.code), values };

  // With e-mail confirmation turned off in Supabase, the account is usable right away.
  if (data.session) redirect("/espace/profil");

  return {
    status: "success",
    message: `Un e-mail de confirmation a été envoyé à ${email}. Cliquez sur le lien pour activer votre compte.`,
  };
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"), "/espace");

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { status: "error", message: "Entrez votre e-mail et votre mot de passe.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: authErrorMessage(error.code), values: { email } };

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
