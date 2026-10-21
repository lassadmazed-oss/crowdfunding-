import "server-only";
import { createClient } from "@supabase/supabase-js";

// Anonymous client with no cookies, safe to use inside `use cache` scopes for public data.
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
