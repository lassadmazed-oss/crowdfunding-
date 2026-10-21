import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on every request and does the optimistic auth redirects.
// Pages still verify the user themselves: this is a convenience, not the security boundary.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims: it would risk random logouts.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname, searchParams } = request.nextUrl;

  // Supabase falls back to the Site URL when the e-mail redirect isn't allow-listed.
  if (pathname === "/" && searchParams.has("code")) {
    return redirectWithCookies(request, response, `/auth/confirm?${searchParams}`);
  }
  if (!signedIn && (pathname.startsWith("/espace") || pathname.startsWith("/admin"))) {
    return redirectWithCookies(request, response, `/connexion?next=${encodeURIComponent(pathname)}`);
  }
  if (signedIn && (pathname === "/connexion" || pathname === "/inscription")) {
    return redirectWithCookies(request, response, "/espace");
  }

  return response;
}

function redirectWithCookies(request: NextRequest, response: NextResponse, path: string) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
