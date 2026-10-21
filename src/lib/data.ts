import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { PROJECT_COLUMNS, STATUS_ORDER, type Project, type ProjectInterest } from "@/lib/domain";

// Public catalogue, cached on the server. Edit projects in Supabase, then they refresh within minutes.

export async function getPublishedProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  cacheLife("minutes");

  const { data, error } = await createPublicClient()
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("created_at", { ascending: true })
    .overrideTypes<Project[], { merge: false }>();
  if (error) throw new Error(`Could not load projects: ${error.message}`);

  return data.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  "use cache";
  cacheTag("projects");
  cacheLife("minutes");

  const { data, error } = await createPublicClient()
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle()
    .overrideTypes<Project | null, { merge: false }>();
  if (error) throw new Error(`Could not load project ${slug}: ${error.message}`);

  return data;
}

export async function getProjectInterest(): Promise<Record<string, ProjectInterest>> {
  "use cache";
  cacheTag("interest");
  cacheLife("minutes");

  const { data, error } = await createPublicClient().rpc("project_interest");
  if (error) throw new Error(`Could not load project interest: ${error.message}`);

  const rows = (data ?? []) as { project_id: string; investor_count: number; total_amount: number }[];
  return Object.fromEntries(
    rows.map((row) => [row.project_id, { investorCount: Number(row.investor_count), totalAmount: Number(row.total_amount) }]),
  );
}
