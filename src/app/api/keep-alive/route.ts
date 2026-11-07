import { createPublicClient } from "@/lib/supabase/public";

// Called once a day by the Vercel cron in vercel.json. Supabase's free plan pauses a project after a
// week without activity, which takes the whole site down; a small daily query keeps it awake.
// Vercel sends `Authorization: Bearer $CRON_SECRET`; anyone else gets a 401.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { error } = await createPublicClient().from("projects").select("id").limit(1);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 502 });
  }
  return Response.json({ ok: true, checkedAt: new Date().toISOString() });
}
