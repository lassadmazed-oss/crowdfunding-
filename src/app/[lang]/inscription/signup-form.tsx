"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { ChoiceCard, Field, FormMessage, inputClass } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { signUp } from "@/lib/actions/auth";
import { idleState } from "@/lib/domain";

export function SignupForm({ locale, t }: { locale: Locale; t: Dictionary["signup"] }) {
  const [state, formAction] = useActionState(signUp, idleState);
  const values = state.values ?? {};

  if (state.status === "success") {
    return (
      <div className="space-y-3 py-6 text-center" role="status">
        <p className="font-display text-2xl font-semibold text-azur-900">{t.successTitle}</p>
        <p className="text-ink-soft">{state.message}</p>
        <p className="text-sm text-muted">{t.spamHint}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="lang" value={locale} />
      <Field label={t.fullName} htmlFor="su-name" error={state.errors?.full_name}>
        <input
          id="su-name"
          name="full_name"
          autoComplete="name"
          required
          defaultValue={String(values.full_name ?? "")}
          aria-invalid={Boolean(state.errors?.full_name)}
          className={inputClass}
        />
      </Field>
      <Field label={t.email} htmlFor="su-email" error={state.errors?.email}>
        <input
          id="su-email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          defaultValue={String(values.email ?? "")}
          aria-invalid={Boolean(state.errors?.email)}
          className={inputClass}
        />
      </Field>
      <Field label={t.password} htmlFor="su-password" error={state.errors?.password} hint={t.passwordHint}>
        <input
          id="su-password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={Boolean(state.errors?.password)}
          className={inputClass}
        />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">{t.residencyLegend}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <ChoiceCard name="residency" value="resident" title={t.resident} defaultChecked={values.residency !== "non_resident"} />
          <ChoiceCard name="residency" value="non_resident" title={t.nonResident} defaultChecked={values.residency === "non_resident"} />
        </div>
        {state.errors?.residency ? <p className="text-sm text-terra-600">{state.errors.residency}</p> : null}
      </fieldset>
      <label className="flex gap-3 rounded-xl bg-sand-50 p-3.5 text-sm text-ink-soft">
        <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0 accent-azur-700" />
        <span>
          {t.consent}
          {state.errors?.consent ? <span className="mt-1 block text-terra-600">{state.errors.consent}</span> : null}
        </span>
      </label>
      <FormMessage status={state.status} message={state.message} />
      <SubmitButton pendingLabel={t.pending} className="w-full">
        {t.submit}
      </SubmitButton>
    </form>
  );
}
