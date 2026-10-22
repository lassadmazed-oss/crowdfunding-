"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Field, FormMessage, inputClass } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { signIn } from "@/lib/actions/auth";
import { idleState } from "@/lib/domain";

export function LoginForm({ locale, t }: { locale: Locale; t: Dictionary["login"] }) {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signIn, idleState);
  const linkFailed = searchParams.get("erreur") === "lien";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="next" value={searchParams.get("next") ?? `/${locale}/espace`} />
      {linkFailed && state.status === "idle" ? <FormMessage status="error" message={t.linkFailed} /> : null}
      <Field label={t.email} htmlFor="li-email">
        <input
          id="li-email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          defaultValue={String(state.values?.email ?? "")}
          className={inputClass}
        />
      </Field>
      <Field label={t.password} htmlFor="li-password">
        <input
          id="li-password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <FormMessage status={state.status} message={state.message} />
      <SubmitButton pendingLabel={t.pending} className="w-full">
        {t.submit}
      </SubmitButton>
    </form>
  );
}
