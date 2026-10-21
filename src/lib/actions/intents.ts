"use server";

import { refresh, updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getProjectBySlug } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatTND, isCollecting, parseAmount, type FormState } from "@/lib/domain";

export async function saveIntent(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Connectez-vous pour déclarer une intention." };

  const project = await getProjectBySlug(String(formData.get("slug") ?? ""));
  if (!project || !isCollecting(project.status)) {
    return { status: "error", message: "Ce projet ne recueille plus d'intentions." };
  }

  const raw = String(formData.get("amount") ?? "");
  const amount = parseAmount(raw);
  const values = { amount: raw };
  if (!Number.isFinite(amount) || amount < project.min_ticket || amount > project.target_amount) {
    return {
      status: "error",
      errors: { amount: `Entre ${formatTND(project.min_ticket)} et ${formatTND(project.target_amount)}.` },
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
    const message =
      error.code === "42501"
        ? "Complétez votre profil investisseur avant de déclarer une intention."
        : "L'enregistrement a échoué. Réessayez.";
    return { status: "error", message, values };
  }

  updateTag("interest");
  refresh();
  return {
    status: "success",
    message: `Intention enregistrée : ${formatTND(amount)}. Elle reste non engageante.`,
  };
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
