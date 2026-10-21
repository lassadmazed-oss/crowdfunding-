import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Acts as the signed-in visitor, so RLS applies. Create a new one per request, never share it.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components can't write cookies; the proxy refreshes the session instead.
          }
        },
      },
    },
  );
}
