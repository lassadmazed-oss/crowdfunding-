"use server";

import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";
import { loadDictionary, type Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_PATTERN, isOneOf, safeNextPath, type FormState } from "@/lib/domain";

function localeOf(formData: FormData) {
  const lang = formData.get("lang");
  return hasLocale(lang) ? lang : DEFAULT_LOCALE;
}

function authErrorMessage(t: Dictionary["authErrors"], code: string | undefined) {
  return (code && code in t ? t[code as keyof typeof t] : undefined) ?? t.generic;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const t = await loadDictionary(locale);
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const residency = formData.get("residency");
  const values = { full_name: fullName, email, residency: String(residency ?? "") };

  const errors: Record<string, string> = {};
  if (fullName.length < 3) errors.full_name = t.signup.errors.fullName;
  if (!EMAIL_PATTERN.test(email)) errors.email = t.signup.errors.email;
  if (password.length < 8) errors.password = t.signup.errors.password;
  if (!isOneOf(residency, ["resident", "non_resident"] as const)) errors.residency = t.signup.errors.residency;
  if (formData.get("consent") !== "on") errors.consent = t.signup.errors.consent;
  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, residency, locale },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm?next=/${locale}/espace/profil`,
    },
  });
  if (error) return { status: "error", message: authErrorMessage(t.authErrors, error.code), values };

  // With e-mail confirmation turned off in Supabase, the account is usable right away.
  if (data.session) redirect(`/${locale}/espace/profil`);

  return { status: "success", message: fill(t.signup.success, { email }) };
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const t = await loadDictionary(locale);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"), `/${locale}/espace`);

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { status: "error", message: t.login.missing, values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: authErrorMessage(t.authErrors, error.code), values: { email } };

  redirect(next);
}

export async function signOut(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${localeOf(formData)}`);
}
