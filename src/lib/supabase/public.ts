import "server-only";
import { createClient } from "@supabase/supabase-js";

// Retries requests that fail at the network level (a reused keep-alive socket closed by the server,
// a DNS hiccup), which happens occasionally during builds on Vercel. HTTP error responses are not
// retried. Writes made with this client are safe to repeat (the waitlist e-mail is unique).
async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (attempt >= 3 || init?.signal?.aborted) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
}

// Anonymous client with no cookies, safe to use inside `use cache` scopes for public data.
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchWithRetry },
  });
}
