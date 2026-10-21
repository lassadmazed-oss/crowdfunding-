import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  PROJECT_COLUMNS,
  type InvestorProfile,
  type KycStatus,
  type Project,
  type ProjectStatus,
  type Residency,
} from "@/lib/domain";

// Back-office data access. The database enforces admin rights (RLS + is_admin()); the checks here
// only decide what to render. Pages call requireAdmin() themselves: layouts render in parallel with
// pages, so a layout-level check would not protect them.

export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
});

// Non-admins get a 404 so the back-office isn't advertised.
export async function requireAdmin() {
  if (!(await isAdmin())) notFound();
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function fail(what: string, error: { message: string }): never {
  throw new Error(`Could not load ${what}: ${error.message}`);
}

export type AdminProject = Project & { updated_at: string };

export async function getAdminProjects(): Promise<AdminProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`${PROJECT_COLUMNS}, updated_at`)
    .order("updated_at", { ascending: false })
    .overrideTypes<AdminProject[], { merge: false }>();
  if (error) fail("projects", error);
  return data;
}

export async function getAdminProject(id: string): Promise<AdminProject | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`${PROJECT_COLUMNS}, updated_at`)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<AdminProject | null, { merge: false }>();
  if (error) fail("project", error);
  return data;
}

export type ProjectIntentRow = {
  id: string;
  amount: number;
  created_at: string;
  investor: { id: string; full_name: string; kyc_status: KycStatus };
};

export async function getProjectIntents(projectId: string): Promise<ProjectIntentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_intents")
    .select("id, amount, created_at, investor:investor_profiles!inner(id, full_name, kyc_status)")
    .eq("project_id", projectId)
    .order("amount", { ascending: false })
    .overrideTypes<ProjectIntentRow[], { merge: false }>();
  if (error) fail("project intents", error);
  return data.map((row) => ({ ...row, amount: Number(row.amount) }));
}

export type WaitlistEntry = {
  id: string;
  email: string;
  full_name: string | null;
  country: string;
  residency: Residency;
  city: string | null;
  ticket_range: string | null;
  interests: string[];
  prefers_sukuk: boolean;
  source: string | null;
  created_at: string;
};

export const WAITLIST_COLUMNS =
  "id, email, full_name, country, residency, city, ticket_range, interests, prefers_sukuk, source, created_at";

export const WAITLIST_PAGE_SIZE = 50;

// Removes characters with a meaning in PostgREST filter syntax before using a search term.
function searchTerm(q: string) {
  return q.replace(/[,()*%\\:"]/g, " ").trim().slice(0, 80);
}

export async function getWaitlist({ q = "", residency, page = 1 }: { q?: string; residency?: Residency; page?: number }) {
  const supabase = await createClient();
  let query = supabase.from("waitlist").select(WAITLIST_COLUMNS, { count: "exact" });

  const term = searchTerm(q);
  if (term) query = query.or(`email.ilike.*${term}*,full_name.ilike.*${term}*`);
  if (residency) query = query.eq("residency", residency);

  const from = (page - 1) * WAITLIST_PAGE_SIZE;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + WAITLIST_PAGE_SIZE - 1)
    .overrideTypes<WaitlistEntry[], { merge: false }>();
  if (error) fail("waitlist", error);
  return { entries: data, total: count ?? 0 };
}

export type AdminInvestor = InvestorProfile & {
  email: string;
  kyc_note: string | null;
  kyc_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  intents_count: number;
  intents_total: number;
};

export async function getAdminInvestors(status?: KycStatus): Promise<AdminInvestor[]> {
  const supabase = await createClient();
  let query = supabase.rpc("admin_investors").select("*");
  if (status) query = query.eq("kyc_status", status);
  const { data, error } = await query;
  if (error) fail("investors", error);
  return (data as AdminInvestor[]).map((row) => ({
    ...row,
    intents_count: Number(row.intents_count),
    intents_total: Number(row.intents_total),
  }));
}

export async function getAdminInvestor(id: string): Promise<AdminInvestor | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_investors").select("*").eq("id", id).maybeSingle();
  if (error) fail("investor", error);
  if (!data) return null;
  const row = data as AdminInvestor;
  return { ...row, intents_count: Number(row.intents_count), intents_total: Number(row.intents_total) };
}

export type InvestorIntentRow = {
  id: string;
  amount: number;
  created_at: string;
  project: { id: string; slug: string; title: string; status: ProjectStatus };
};

export async function getInvestorIntents(investorId: string): Promise<InvestorIntentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_intents")
    .select("id, amount, created_at, project:projects!inner(id, slug, title, status)")
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false })
    .overrideTypes<InvestorIntentRow[], { merge: false }>();
  if (error) fail("investor intents", error);
  return data.map((row) => ({ ...row, amount: Number(row.amount) }));
}

export async function getAdminStats() {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const waitlist = () => supabase.from("waitlist").select("id", { count: "exact", head: true });
  const countOf = async (query: PromiseLike<{ count: number | null; error: { message: string } | null }>) => {
    const { count, error } = await query;
    if (error) fail("waitlist count", error);
    return count ?? 0;
  };

  const [waitlistTotal, waitlistAbroad, waitlistWeek, investors, intents, projects] = await Promise.all([
    countOf(waitlist()),
    countOf(waitlist().eq("residency", "non_resident")),
    countOf(waitlist().gte("created_at", weekAgo)),
    supabase.rpc("admin_investors").select("kyc_status"),
    supabase.from("investment_intents").select("amount"),
    supabase.from("projects").select("status"),
  ]);
  if (investors.error) fail("investor stats", investors.error);
  if (intents.error) fail("intent stats", intents.error);
  if (projects.error) fail("project stats", projects.error);

  const investorRows = investors.data as { kyc_status: KycStatus }[];
  const kyc = { incomplete: 0, pending_review: 0, verified: 0, rejected: 0 } satisfies Record<KycStatus, number>;
  for (const row of investorRows) kyc[row.kyc_status] += 1;

  return {
    waitlist: { total: waitlistTotal, abroad: waitlistAbroad, lastWeek: waitlistWeek },
    investors: { total: investorRows.length, ...kyc },
    intents: { count: intents.data.length, total: intents.data.reduce((sum, row) => sum + Number(row.amount), 0) },
    projects: {
      published: projects.data.filter((row) => row.status !== "draft").length,
      drafts: projects.data.filter((row) => row.status === "draft").length,
    },
  };
}
