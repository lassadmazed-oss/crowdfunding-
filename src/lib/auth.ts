import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { InvestorProfile, ProjectStatus } from "@/lib/domain";

// Data access layer for the signed-in investor. Every read goes through RLS as that user.

export type CurrentUser = { id: string; email: string };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

export const getInvestorProfile = cache(async (): Promise<InvestorProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investor_profiles")
    .select(
      "id, full_name, phone, country, residency, city, birth_date, profession, annual_income_range, " +
        "investable_assets_range, experience_level, prefers_sukuk, risk_acknowledged_at, kyc_status",
    )
    .eq("id", user.id)
    .maybeSingle()
    .overrideTypes<InvestorProfile | null, { merge: false }>();
  if (error) throw new Error(`Could not load investor profile: ${error.message}`);

  return data;
});

export type MyIntent = {
  id: string;
  amount: number;
  created_at: string;
  project: { id: string; slug: string; title: string; city: string; status: ProjectStatus };
};

export const getMyIntents = cache(async (): Promise<MyIntent[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_intents")
    .select("id, amount, created_at, project:projects!inner(id, slug, title, city, status)")
    .eq("investor_id", user.id)
    .order("created_at", { ascending: false })
    .overrideTypes<MyIntent[], { merge: false }>();
  if (error) throw new Error(`Could not load intents: ${error.message}`);

  return data.map((intent) => ({ ...intent, amount: Number(intent.amount) }));
});
