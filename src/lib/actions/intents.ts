"use server";

import { refresh, updateTag } from "next/cache";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";
import { loadDictionary } from "@/i18n/dictionaries";
import { fill, formatTND } from "@/i18n/format";
import { getCurrentUser } from "@/lib/auth";
import { getProjectBySlug } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isCollecting, parseAmount, type FormState } from "@/lib/domain";

export async function saveIntent(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = formData.get("lang");
  const locale = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = (await loadDictionary(locale)).intent;

  const user = await getCurrentUser();
  if (!user) return { status: "error", message: t.errors.login };

  const project = await getProjectBySlug(String(formData.get("slug") ?? ""));
  if (!project || !isCollecting(project.status)) {
    return { status: "error", message: t.errors.closed };
  }

  const raw = String(formData.get("amount") ?? "");
  const amount = parseAmount(raw);
  const values = { amount: raw };
  if (!Number.isFinite(amount) || amount < project.min_ticket || amount > project.target_amount) {
    return {
      status: "error",
      errors: {
        amount: fill(t.errors.range, {
          min: formatTND(project.min_ticket, locale),
          max: formatTND(project.target_amount, locale),
        }),
      },
      values,
    };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("investment_intents")
    .select("id")
    .eq("project_id", project.id)
    .eq("investor_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("investment_intents").update({ amount }).eq("id", existing.id)
    : await supabase.from("investment_intents").insert({ project_id: project.id, amount });

  if (error) {
    // RLS rejects intents from investors whose questionnaire isn't complete.
    return { status: "error", message: error.code === "42501" ? t.errors.profile : t.errors.failed, values };
  }

  updateTag("interest");
  refresh();
  return { status: "success", message: fill(t.success, { amount: formatTND(amount, locale) }) };
}

export async function withdrawIntent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase
    .from("investment_intents")
    .delete()
    .eq("project_id", String(formData.get("project_id") ?? ""))
    .eq("investor_id", user.id);

  updateTag("interest");
  refresh();
}
