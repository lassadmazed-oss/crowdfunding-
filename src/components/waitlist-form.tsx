"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { ChoiceCard, Field, FormMessage, inputClass } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { joinWaitlist } from "@/lib/actions/waitlist";
import { COUNTRY_CODES, MODEL_ORDER, TICKET_RANGE_CODES, idleState } from "@/lib/domain";

type Labels = Dictionary["labels"];

export function WaitlistForm({
  locale,
  t,
  models,
  countries,
  ticketRanges,
}: {
  locale: Locale;
  t: Dictionary["waitlist"];
  models: Labels["models"];
  countries: Labels["countries"];
  ticketRanges: Labels["ticketRanges"];
}) {
  const [state, formAction] = useActionState(joinWaitlist, idleState);
  const values = state.values ?? {};
  const [residency, setResidency] = useState(String(values.residency ?? "resident"));

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-olive-600/30 bg-olive-50 p-6 text-center" role="status">
        <p className="font-display text-2xl font-semibold text-olive-600">{t.successTitle}</p>
        <p className="mt-2 text-ink-soft">{state.message}</p>
      </div>
    );
  }

  const interests = Array.isArray(values.interests) ? values.interests : [];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.email} htmlFor="wl-email" error={state.errors?.email}>
          <input
            id="wl-email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            defaultValue={String(values.email ?? "")}
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "wl-email-error" : undefined}
            className={inputClass}
            placeholder={t.emailPlaceholder}
          />
        </Field>
        <Field label={t.name} htmlFor="wl-name">
          <input
            id="wl-name"
            name="full_name"
            autoComplete="name"
            defaultValue={String(values.full_name ?? "")}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset
        className="space-y-2"
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) setResidency(event.target.value);
        }}
      >
        <legend className="text-sm font-medium text-ink">{t.residencyLegend}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <ChoiceCard name="residency" value="resident" title={t.resident} defaultChecked={residency === "resident"} />
          <ChoiceCard
            name="residency"
            value="non_resident"
            title={t.nonResident}
            description={t.nonResidentHint}
            defaultChecked={residency === "non_resident"}
          />
        </div>
        {state.errors?.residency ? <p className="text-sm text-terra-600">{state.errors.residency}</p> : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        {residency === "non_resident" ? (
          <Field label={t.country} htmlFor="wl-country" error={state.errors?.country}>
            <select
              id="wl-country"
              name="country"
              defaultValue={String(values.country || (locale === "de" ? "DE" : locale === "it" ? "IT" : "FR"))}
              aria-invalid={Boolean(state.errors?.country)}
              className={inputClass}
            >
              {COUNTRY_CODES.filter((code) => code !== "TN").map((code) => (
                <option key={code} value={code}>
                  {countries[code]}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label={t.ticket} htmlFor="wl-ticket" error={state.errors?.ticket_range}>
          <select id="wl-ticket" name="ticket_range" defaultValue={String(values.ticket_range ?? "")} className={inputClass}>
            <option value="">{t.ticketUnknown}</option>
            {TICKET_RANGE_CODES.map((code) => (
              <option key={code} value={code}>
                {ticketRanges[code]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">{t.interests}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODEL_ORDER.map((model) => (
            <ChoiceCard
              key={model}
              type="checkbox"
              name="interests"
              value={model}
              title={models[model].label}
              defaultChecked={interests.includes(model)}
            />
          ))}
        </div>
      </fieldset>

      <FormMessage status={state.status} message={state.message} />

      <SubmitButton pendingLabel={t.pending} className="w-full sm:w-auto">
        {t.submit}
      </SubmitButton>
      <p className="text-xs text-muted">{t.privacy}</p>
    </form>
  );
}
