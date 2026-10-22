import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, hasLocale, matchLocale } from "@/i18n/config";

// Runs on every request: refreshes the Supabase session cookie, puts a language prefix on public
// URLs, and does the optimistic auth redirects. Pages still verify the user themselves.
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
  const { pathname, searchParams, search } = request.nextUrl;

  // Supabase falls back to the Site URL when the e-mail redirect isn't allow-listed.
  if (pathname === "/" && searchParams.has("code")) {
    return redirectWithCookies(request, response, `/auth/confirm?${searchParams}`);
  }

  // The back-office and auth callbacks are not translated.
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    if (!signedIn && pathname.startsWith("/admin")) {
      return redirectWithCookies(request, response, `/${preferredLocale(request)}/connexion?next=${encodeURIComponent(pathname)}`);
    }
    return response;
  }

  const [, first, section] = pathname.split("/");
  if (!hasLocale(first)) {
    return redirectWithCookies(request, response, `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}${search}`);
  }

  // Remember the language the visitor last used.
  if (request.cookies.get(LOCALE_COOKIE)?.value !== first) {
    response.cookies.set(LOCALE_COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  if (!signedIn && section === "espace") {
    return redirectWithCookies(request, response, `/${first}/connexion?next=${encodeURIComponent(pathname)}`);
  }
  if (signedIn && (section === "connexion" || section === "inscription")) {
    return redirectWithCookies(request, response, `/${first}/espace`);
  }

  return response;
}

function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(saved)) return saved;
  return matchLocale(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;
}

function redirectWithCookies(request: NextRequest, response: NextResponse, path: string) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
