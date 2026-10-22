import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, hasLocale } from "@/i18n/config";
import { safeNextPath } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";

// Landing point for the links in Supabase auth e-mails (sign-up confirmation, magic links).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), `/${locale}/espace/profil`);

  const supabase = await createClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
  }

  redirect(`/${locale}/connexion?erreur=lien`);
}
