"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { ChoiceCard, Field, FormMessage, inputClass } from "@/components/ui";
import { joinWaitlist } from "@/lib/actions/waitlist";
import { COUNTRIES, MODELS, MODEL_ORDER, TICKET_RANGES, idleState } from "@/lib/domain";

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlist, idleState);
  const values = state.values ?? {};
  const [residency, setResidency] = useState(String(values.residency ?? "resident"));

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-olive-600/30 bg-olive-50 p-6 text-center" role="status">
        <p className="font-display text-2xl font-semibold text-olive-600">Merci !</p>
        <p className="mt-2 text-ink-soft">{state.message}</p>
      </div>
    );
  }

  const interests = Array.isArray(values.interests) ? values.interests : [];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mail" htmlFor="wl-email" error={state.errors?.email}>
          <input
            id="wl-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={String(values.email ?? "")}
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "wl-email-error" : undefined}
            className={inputClass}
            placeholder="vous@exemple.com"
          />
        </Field>
        <Field label="Nom (facultatif)" htmlFor="wl-name">
          <input
            id="wl-name"
            name="full_name"
            autoComplete="name"
            defaultValue={String(values.full_name ?? "")}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Vous habitez…</legend>
        <div className="grid gap-2 sm:grid-cols-2" onChange={(event) => setResidency((event.target as HTMLInputElement).value)}>
          <ChoiceCard name="residency" value="resident" title="En Tunisie" defaultChecked={residency === "resident"} />
          <ChoiceCard
            name="residency"
            value="non_resident"
            title="À l'étranger"
            description="Tunisiens résidents à l'étranger"
            defaultChecked={residency === "non_resident"}
          />
        </div>
        {state.errors?.residency ? <p className="text-sm text-terra-600">{state.errors.residency}</p> : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        {residency === "non_resident" ? (
          <Field label="Pays de résidence" htmlFor="wl-country" error={state.errors?.country}>
            <select
              id="wl-country"
              name="country"
              defaultValue={String(values.country ?? "FR")}
              aria-invalid={Boolean(state.errors?.country)}
              className={inputClass}
            >
              {COUNTRIES.filter(([code]) => code !== "TN").map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Montant envisagé" htmlFor="wl-ticket" error={state.errors?.ticket_range}>
          <select id="wl-ticket" name="ticket_range" defaultValue={String(values.ticket_range ?? "")} className={inputClass}>
            <option value="">Je ne sais pas encore</option>
            {TICKET_RANGES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Ce qui vous intéresse</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODEL_ORDER.map((model) => (
            <ChoiceCard
              key={model}
              type="checkbox"
              name="interests"
              value={model}
              title={MODELS[model].label}
              defaultChecked={interests.includes(model)}
            />
          ))}
        </div>
      </fieldset>

      <FormMessage status={state.status} message={state.message} />

      <SubmitButton pendingLabel="Inscription…" className="w-full sm:w-auto">
        Rejoindre la liste d&apos;attente
      </SubmitButton>
      <p className="text-xs text-muted">
        Nous utilisons votre e-mail uniquement pour vous informer du lancement de Lebna.
      </p>
    </form>
  );
}
