"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { ChoiceCard, Field, FormMessage, inputClass } from "@/components/ui";
import { signUp } from "@/lib/actions/auth";
import { idleState } from "@/lib/domain";

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, idleState);
  const values = state.values ?? {};

  if (state.status === "success") {
    return (
      <div className="space-y-3 py-6 text-center" role="status">
        <p className="font-display text-2xl font-semibold text-azur-900">Vérifiez votre boîte mail</p>
        <p className="text-ink-soft">{state.message}</p>
        <p className="text-sm text-muted">Pensez à regarder dans les courriers indésirables.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field label="Nom complet" htmlFor="su-name" error={state.errors?.full_name}>
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
      <Field label="E-mail" htmlFor="su-email" error={state.errors?.email}>
        <input
          id="su-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={String(values.email ?? "")}
          aria-invalid={Boolean(state.errors?.email)}
          className={inputClass}
        />
      </Field>
      <Field label="Mot de passe" htmlFor="su-password" error={state.errors?.password} hint="8 caractères minimum">
        <input
          id="su-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={Boolean(state.errors?.password)}
          className={inputClass}
        />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Vous habitez…</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <ChoiceCard name="residency" value="resident" title="En Tunisie" defaultChecked={values.residency !== "non_resident"} />
          <ChoiceCard name="residency" value="non_resident" title="À l'étranger" defaultChecked={values.residency === "non_resident"} />
        </div>
        {state.errors?.residency ? <p className="text-sm text-terra-600">{state.errors.residency}</p> : null}
      </fieldset>
      <label className="flex gap-3 rounded-xl bg-sand-50 p-3.5 text-sm text-ink-soft">
        <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0 accent-azur-700" />
        <span>
          J&apos;ai compris que Lebna est en cours d&apos;agrément, qu&apos;aucune somme n&apos;est collectée
          aujourd&apos;hui et que mes intentions sont non engageantes.
          {state.errors?.consent ? <span className="mt-1 block text-terra-600">{state.errors.consent}</span> : null}
        </span>
      </label>
      <FormMessage status={state.status} message={state.message} />
      <SubmitButton pendingLabel="Création du compte…" className="w-full">
        Créer mon compte
      </SubmitButton>
    </form>
  );
}
